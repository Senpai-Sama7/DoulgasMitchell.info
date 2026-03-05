import { MainLayout } from "@/components/main-layout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book Samples | Douglas Mitchell Author",
  description: "Read chapter previews and excerpts from Douglas Mitchell's novels.",
};

export default function SamplesPage() {
  const samples = [
    {
      title: "The Midnight Garden",
      chapter: "Chapter 1: The Discovery",
      excerpt: "The old key turned with surprising ease, as if the lock had been waiting decades for this moment. Sarah pushed open the garden gate, its hinges singing a rusty melody that seemed to echo through time itself...",
      year: "2023",
      genre: "Mystery Fiction",
    },
    {
      title: "Echoes of Tomorrow",
      chapter: "Prologue: The Last Message",
      excerpt: "In the silence between heartbeats, Marcus heard the future calling. The device in his hands hummed with impossible energy, its screen displaying coordinates that shouldn't exist for another fifty years...",
      year: "2022",
      genre: "Science Fiction",
    },
    {
      title: "The Painter's Daughter",
      chapter: "Chapter 3: Hidden Colors",
      excerpt: "Elena discovered the hidden room behind her father's studio on a Tuesday morning when the light fell just right across the wooden panels. The secret door revealed canvases that would change everything she thought she knew...",
      year: "2021",
      genre: "Historical Fiction",
    },
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-black text-white py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-8">
            Book Samples
          </h1>
          
          <p className="text-xl text-gray-300 mb-16 leading-relaxed">
            Dive into Douglas Mitchell's storytelling with these chapter previews 
            and excerpts from his acclaimed novels.
          </p>

          <div className="space-y-12">
            {samples.map((sample, index) => (
              <div 
                key={index}
                className="bg-white/5 border border-white/10 rounded-2xl p-8"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-serif font-bold text-white mb-2">
                      {sample.title}
                    </h2>
                    <p className="text-lg text-gray-400">
                      {sample.chapter} • {sample.genre} • {sample.year}
                    </p>
                  </div>
                </div>
                
                <div className="bg-black/30 border border-white/5 rounded-xl p-6 mb-6">
                  <p className="text-gray-300 leading-relaxed text-lg italic">
                    "{sample.excerpt}"
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                    Read Full Chapter
                  </button>
                  <button className="border border-white/20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
                    Purchase Book
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="text-3xl font-serif font-bold mb-4">Want More?</h2>
            <p className="text-gray-300 mb-6">
              Subscribe to our newsletter for exclusive excerpts, early access to new chapters, 
              and behind-the-scenes insights into Douglas's writing process.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <input 
                type="email" 
                placeholder="Enter your email address"
                className="flex-1 bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
              />
              <button className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}