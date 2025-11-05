import { CalendarIcon, ClockIcon, StarIcon, UserCircleIcon, UsersIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { DescriptionSection } from './sections/DescriptionSection';
import {
  getEvent,
  updateDescription,
  uploadMedia,
  updateStatus,
  updateRating,
  updateSelectedDate,
  incrementView,
} from '../../../../../api/events';
import { EventStatusSection } from './sections/EventStatusSection';
import { ScheduleSection } from './sections/ScheduleSection';
import styles from './EventPageOrganizer.module.css';

export const EventPageOrganizer = () => {
  const activityId = 'test-event';
  const [evt, setEvt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await getEvent(activityId);
        if (mounted) setEvt(data);
      } catch (err) {
        // avoid using console in production—use a noop logger so ESLint no-console rule is satisfied
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.error('load event failed', err);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);
  return (
    <div className={styles.container} data-model-id="3572:7958">
      <div className={styles.contentWrapper}>
        <EventStatusSection />

        <div className={styles.eventCard}>
          <div className={styles.eventCardContent}>
            <div className={styles.eventImageSection}>
              <div
                className={styles.eventImage}
                style={{ backgroundImage: `url(${evt?.coverImage || ''})` }}
              />
              <div className={styles.statusBadge}>
                <div className={styles.statusText}>{evt?.status ?? '—'}</div>
              </div>
            </div>

            <div className={styles.eventDetailsSection}>
              <div className={styles.eventHeader}>
                <div className={styles.eventType}>
                  Event&nbsp;&nbsp;/&nbsp;&nbsp;{evt?.eventType ?? '—'}
                </div>
                <div className={styles.eventTitle}>{evt?.name ?? 'Event Name'}</div>
              </div>

              <div className={styles.eventLinks}>
                <div className={styles.linkRow}>
                  <span className={styles.linkLabel}>Location:</span>
                  <span className={styles.linkLabel}>{evt?.location ?? '—'}</span>
                </div>
                <div className={styles.linkRow}>
                  <span className={styles.linkLabel}>Link:</span>
                  <span className={styles.linkValue}>{evt?.zoomLink ?? '—'}</span>
                </div>
              </div>

              <div className={styles.divider} />

              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <div className={styles.detailLabel}>
                    <CalendarIcon className="w-3 h-3.5 text-black" />
                    <span className={styles.detailLabelText}>Date</span>
                  </div>
                  <div className={styles.detailValue}>{evt?.selectedDate ?? '—'}</div>
                </div>

                <div className={styles.detailItem}>
                  <div className={styles.detailLabel}>
                    <ClockIcon className="w-3 h-[13px] text-black" />
                    <span className={styles.detailLabelText}>Time</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={styles.detailValue}>
                      {evt?.time?.start} - {evt?.time?.end}
                    </span>
                    <span className={styles.detailValue}>{evt?.time?.timezone}</span>
                  </div>
                </div>

                <div className={styles.detailItem}>
                  <div className={styles.detailLabel}>
                    <UserCircleIcon className="w-[13px] h-[13px] text-black" />
                    <span className={styles.detailLabelText}>Orgnizer</span>
                  </div>
                  <div className={styles.detailValue}>{evt?.organizer?.name ?? '—'}</div>
                </div>

                <div className={styles.detailItem}>
                  <div className={styles.detailLabel}>
                    <UsersIcon className="w-[19px] h-[13px] text-black" />
                    <span className={styles.detailLabelText}>Capacity</span>
                  </div>
                  <div className={styles.capacityValue}>
                    <span className={styles.capacityUsed}>
                      {evt?.capacity?.used ?? 0}&nbsp;&nbsp;
                    </span>
                    <span className={styles.capacityTotal}>
                      /&nbsp;&nbsp;{evt?.capacity?.total ?? 0}
                    </span>
                  </div>
                </div>

                <div className={styles.detailItem}>
                  <div className={styles.detailLabel}>
                    <StarIcon className="w-[19px] h-[19px] text-black" />
                    <span className={styles.detailLabelText}>Overall Rating</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={styles.detailValue}>{evt?.rating ?? 0}</span>
                  </div>
                </div>

                <div className={styles.detailItem}>
                  <div className={styles.detailLabel}>
                    <img
                      className="w-[19px] h-[19px]"
                      alt="Notes"
                      src="https://c.animaapp.com/mhkba7ef3J2kka/img/notes.png"
                    />
                    <span className={styles.detailLabelText}>Status</span>
                  </div>
                  <div className={`${styles.detailValue} ${styles.statusActive}`}>
                    {evt?.status ?? '—'}
                  </div>
                </div>
              </div>

              <div className={styles.divider} />

              <div className={styles.attendeesRow}>
                {(evt?.attendees ?? []).map((attendee, index) => (
                  <Avatar
                    key={index}
                    className={`${styles.avatar} ${index > 0 ? styles.avatarOverlap : ''}`}
                  >
                    <AvatarImage
                      src={attendee.avatar || attendee.src}
                      alt={attendee.name || attendee.alt}
                    />
                    <AvatarFallback>{(attendee.name || '')[0] ?? 'A'}</AvatarFallback>
                  </Avatar>
                ))}
                <div className={styles.moreCount}>
                  <span className={styles.moreCountText}>
                    +{Math.max(0, (evt?.capacity?.used ?? 0) - (evt?.attendees?.length ?? 0))}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 w-[238px] relative">
              <div className="absolute top-0 right-0 flex gap-2 items-center bg-[#f3f3f3] rounded-lg px-2 py-1.5">
                <div className="w-[19px] h-[19px] bg-[#f96d6d] rounded-full" />
                <img
                  className="w-[17px] h-[17px]"
                  alt="Sort down"
                  src="https://c.animaapp.com/mhkba7ef3J2kka/img/sort-down.png"
                />
              </div>

              <div className="absolute top-[98px] left-0 w-full h-px bg-[#e5e5e5]" />

              <ScheduleSection />
            </div>
          </div>
        </div>

        <Tabs defaultValue="description" className={styles.tabsContainer}>
          <TabsList
            style={{ display: 'flex', flexDirection: 'row', width: '100%' }}
            className="bg-transparent border-b border-[#e5e5e5] rounded-none p-0 gap-0"
          >
            <TabsTrigger
              value="description"
              style={{ flex: 1 }}
              className="text-center rounded-none px-0 py-4 text-2xl font-semibold
                 data-[state=active]:text-black data-[state=inactive]:text-[#00000099]
                 data-[state=active]:border-b-2 data-[state=active]:border-[#81b6e7]
                 bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Description
            </TabsTrigger>

            <TabsTrigger
              value="analysis"
              style={{ flex: 1 }}
              className="text-center rounded-none px-0 py-4 text-2xl font-semibold
                 data-[state=active]:text-black data-[state=inactive]:text-[#666666]
                 data-[state=active]:border-b-2 data-[state=active]:border-[#81b6e7]
                 bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Analysis
            </TabsTrigger>

            <TabsTrigger
              value="resource"
              style={{ flex: 1 }}
              className="text-center rounded-none px-0 py-4 text-2xl font-semibold
                 data-[state=active]:text-black data-[state=inactive]:text-[#666666]
                 data-[state=active]:border-b-2 data-[state=active]:border-[#81b6e7]
                 bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Resource
            </TabsTrigger>

            <TabsTrigger
              value="engagement"
              style={{ flex: 1 }}
              className="text-center rounded-none px-0 py-4 text-2xl font-semibold
                 data-[state=active]:text-black data-[state=inactive]:text-[#666666]
                 data-[state=active]:border-b-2 data-[state=active]:border-[#81b6e7]
                 bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Engagement
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-8">
            <DescriptionSection
              activityId={activityId}
              initialDescription={evt?.description ?? ''}
              onSaveDescription={async next => {
                try {
                  await updateDescription(activityId, next);
                  setEvt(prev => ({ ...prev, description: next }));
                } catch (err) {
                  if (process.env.NODE_ENV === 'development') {
                    // eslint-disable-next-line no-console
                    console.error('updateDescription failed', err);
                  }
                }
              }}
              uploadMediaFn={uploadMedia}
            />
          </TabsContent>

          <TabsContent value="analysis" className="mt-8">
            <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">Analysis content</span>
            </div>
          </TabsContent>

          <TabsContent value="resource" className="mt-8">
            <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">Resource content</span>
            </div>
          </TabsContent>

          <TabsContent value="engagement" className="mt-8">
            <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">Engagement content</span>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
