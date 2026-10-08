import httpService from './httpService';
import { ENDPOINTS } from '../utils/URL';

const announcementPayload = ({ title, body, audience, groupId }) => ({
  title,
  body,
  audience,
  // Omission preserves targeting on update; null explicitly restores broad targeting.
  // Recipient IDs are resolved by the backend and are never included here.
  ...(groupId === undefined ? {} : { groupId }),
});

export const getEducatorAnnouncements = async params => {
  const response = await httpService.get(ENDPOINTS.EDUCATOR_ANNOUNCEMENTS(), { params });
  return response.data;
};

export const getStudentAnnouncements = async params => {
  const response = await httpService.get(ENDPOINTS.STUDENT_ANNOUNCEMENTS(), { params });
  return response.data;
};

export const createAnnouncement = async ({ title, body, audience, groupId }) => {
  const response = await httpService.post(
    ENDPOINTS.EDUCATOR_ANNOUNCEMENTS(),
    announcementPayload({ title, body, audience, groupId }),
  );
  return response.data;
};

export const updateAnnouncement = async (announcementId, { title, body, audience, groupId }) => {
  const response = await httpService.put(
    ENDPOINTS.EDUCATOR_ANNOUNCEMENT(announcementId),
    announcementPayload({ title, body, audience, groupId }),
  );
  return response.data;
};

export const normalizeAnnouncement = announcement => ({
  id: String(announcement._id),
  title: announcement.title,
  body: announcement.body,
  audience: announcement.audience,
  groupId: announcement.groupId ? String(announcement.groupId) : null,
  authorId: String(announcement.user_id),
  author:
    [announcement.creatorInfo?.firstName, announcement.creatorInfo?.lastName]
      .filter(Boolean)
      .join(' ')
      .trim() || 'Unknown',
  createdAt: announcement.created_at || announcement.createdAt,
  updatedAt: announcement.updatedAt,
});

// Load every page so existing client-side search and filters cover the complete feed.
export const loadAnnouncementFeed = async getPage => {
  const announcements = [];
  let page = 1;
  let totalPages;
  do {
    const response = await getPage({ page, limit: 100 });
    announcements.push(...response.data.map(normalizeAnnouncement));
    totalPages = response.pagination.totalPages;
    page += 1;
  } while (page <= totalPages);
  return announcements;
};
