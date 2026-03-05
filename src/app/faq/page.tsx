import { MainLayout } from "@/components/main-layout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ | Douglas Mitchell Author",
  description: "Frequently asked questions about Douglas Mitchell's books, writing process, and upcoming projects.",
};

export default function FAQPage() {
  const faqs = [
    {
      question: "When did you start writing?",
      answer: "I began writing seriously in college, but I've been telling stories since childhood. My first published work appeared in 2018, and I haven't looked back since."
    },
    {
      question: "What inspires your stories?",
      answer: "Inspiration comes from everywhere - overheard conversations, historical events, dreams, and the complex emotions we all navigate. I'm particularly drawn to stories that explore human resilience and transformation."
    },
    {
      question: "How long does it take you to write a book?",
      answer: "Each book is different, but typically it takes me 12-18 months from first draft to final manuscript. This includes multiple revisions, research, and collaboration with my editor."
    },
    {
      question: "Do you have a writing routine?",
      answer: "I write best in the early morning hours, usually starting around 5 AM with coffee and complete silence. I aim for 1,000 words per day, though some days are more productive than others."
    },
    {
      question: "What's your next book about?",
      answer: "I'm currently working on a novel that explores themes of memory and identity through the lens of a family secret spanning three generations. It's scheduled for release in late 2024."
    },
    {
      question: "Do you read while you're writing?",
      answer: "Absolutely! Reading is essential to writing. I try to read outside my genre while working on a project to avoid unconscious influence, but I'm always reading something."
    },
    {
      question: "How do you handle writer's block?",
      answer: "I've learned that writer's block is often a sign that something isn't working in the story. I step away, go for walks, or work on character development exercises until the solution reveals itself."
    },
    {
      question: "Will you read my manuscript?",
      answer: "While I'm flattered by these requests, I'm unable to read unpublished manuscripts due to legal and time constraints. I recommend joining writing groups and working with professional editors."
    }
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-black text-white py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-8">
            Frequently Asked Questions
          </h1>
          
          <p className="text-xl text-gray-300 mb-16 leading-relaxed">
            Common questions about my writing process, inspiration, and upcoming projects.
          </p>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="bg-white/5 border border-white/10 rounded-2xl p-8"
              >
                <h3 className="text-xl font-serif font-bold text-white mb-4">
                  {faq.question}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="text-3xl font-serif font-bold mb-4">Have Another Question?</h2>
            <p className="text-gray-300 mb-6">
              Can't find what you're looking for? Feel free to reach out directly. 
              I try to respond to all reader inquiries personally.
            </p>
            <a 
              href="/contact" 
              className="inline-block bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Contact Douglas
            </a>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}