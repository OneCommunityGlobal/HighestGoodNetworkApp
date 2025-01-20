import './ActivityAgenda.css';
import ActivityImg from '../../../assets/images/yoga-img.png';

function ActivityAgenda() {
  // Data
  const eventData = {
    activityName: 'Yoga Session',
    description:
      "Our Yoga Session is designed to provide a peaceful and invigorating experience for people of all fitness levels. Whether you are a beginner or a seasoned practitioner, this class will guide you through a series of asanas (poses) that will improve flexibility, strength, and mindfulness. Led by **Jane Doe**, a certified yoga instructor with over 10 years of experience, the session focuses on mindfulness, breath control (pranayama), and body awareness. Jane's teaching style emphasizes proper alignment, modifications for different skill levels, and creating an inclusive, welcoming space for all participants. The class begins with a gentle warm-up to prepare the body, followed by breathwork exercises to calm the mind and enhance focus. The main flow consists of standing poses, seated stretches, and core work, with variations offered to accommodate everyone. As the session progresses, you'll experience a cool-down phase with restorative stretches and a guided relaxation to release any tension. The class concludes with a brief meditation or mindfulness practice to help you center yourself and leave with a sense of calm. To make the most of your experience, please bring a yoga mat, comfortable clothing, a water bottle, a towel, and any optional props such as yoga blocks or straps. You can expect a calming, positive environment with soothing music, and the instructor will provide adjustments as needed to help you get the most out of your practice. Yoga offers numerous benefits, including improved flexibility, increased strength, reduced stress, enhanced mental focus, and better energy levels. This session is perfect for anyone looking to deepen their practice, relieve stress, or simply enjoy a calming and rejuvenating experience. Join us for this transformative yoga class — we look forward to seeing you on the mat!",
    schedule: [
      { time: '9:00 to 10:00', activity: 'Morning Meditation' },
      { time: '10:00 to 11:00', activity: 'Sun Salutation' },
      { time: '11:00 to 12:00', activity: 'Stretching and Breathing Exercises' },
    ],
    image: ActivityImg,
  };

  return (
    <div className="container">
      <div className="image">
        <img src={eventData.image} alt="Activity" />
      </div>
      <div className="content">
        <h1>{eventData.activityName}</h1>
        <p>{eventData.description}</p>
        <h1>Schedule of the day</h1>
        {eventData.schedule.map(item => (
          <p key={`${item.time}-${item.activity}`}>
            {item.time} - {item.activity}
          </p>
        ))}
      </div>
    </div>
  );
}

export default ActivityAgenda;
