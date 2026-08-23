import VideoLessons from './VideoLessons';
import Gallery from './Gallery';

export default function Media() {
  return (
    <section id="media" className="scroll-mt-24 relative overflow-hidden">
      <div className="apple-section pb-4 sm:pb-6">
        <div className="apple-container">
          <div className="mx-auto max-w-3xl text-center">
            <p className="apple-eyebrow mb-3">Media</p>
            <h2 className="apple-heading text-3xl sm:text-4xl">Maktab hayotini ko‘ring</h2>
            <p className="apple-subheading mt-4">Video darslar, galereya va maktab tadbirlariga oid media materiallar bir joyda.</p>
          </div>
        </div>
      </div>
      <VideoLessons />
      <Gallery />
    </section>
  );
}
