import { MainLayout } from "@/components/main-layout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events | Douglas Mitchell Author",
  description: "Upcoming book signings, readings, and literary events with Douglas Mitchell.",
};

export default function EventsPage() {
  const events = [
    {
      date: "2024-03-15",
      time: "7:00 PM",
      title: "Book Launch & Signing",
      venue: "Barnes & Noble Downtown",
      location: "New York, NY",
      description: "Join Douglas for the official launch of his latest novel.",
    },
    {
      date: "2024-03-22",
      time: "2:00 PM",
      title: "Literary Reading",
      venue: "Central Library",
      location: "Chicago, IL",
      description: "An intimate reading from upcoming works.",
    },
    {
      date: "2024-04-05",
      time: "6:30 PM",
      title: "Author Talk & Q&A",
      venue: "University Bookstore",
      location: "Seattle, WA",
      description: "Discussion on the writing process and inspiration.",
    },
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-black text-white py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-8">
            Upcoming Events
          </h1>
          
          <p className="text-xl text-gray-300 mb-16 leading-relaxed">
            Meet Douglas Mitchell at these upcoming literary events. Book signings, 
            readings, and conversations about the craft of storytelling.
          </p>

          <div className="space-y-8">
            {events.map((event, index) => (
              <div 
                key={index}
                className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-white mb-2">
                      {event.title}
                    </h3>
                    <p className="text-lg text-gray-300">
                      {event.venue} • {event.location}
                    </p>
                  </div>
                  <div className="text-right mt-4 md:mt-0">
                    <div className="text-xl font-bold text-white">
                      {new Date(event.date).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                    <div className="text-gray-400">{event.time}</div>
                  </div>
                </div>
                <p className="text-gray-300">{event.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="text-3xl font-serif font-bold mb-4">Book a Reading</h2>
            <p className="text-gray-300 mb-6">
              Interested in having Douglas speak at your event? Contact us to discuss 
              availability for book clubs, libraries, and literary festivals.
            </p>
            <a 
              href="/contact" 
              className="inline-block bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Contact for Bookings
            </a>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}