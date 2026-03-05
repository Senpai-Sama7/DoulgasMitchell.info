import { MainLayout } from "@/components/main-layout";
import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About Douglas Mitchell | Author Bio",
  description: "Learn about Douglas Mitchell's journey as an author, his inspirations, and his creative process.",
};

export default function AboutPage() {
  return (
    <MainLayout>
      <main className="min-h-screen bg-black text-white py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-8">
            About the Author
          </h1>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div>
              <Image
                src="/images/author.jpg"
                alt="Douglas Mitchell"
                width={600}
                height={800}
                className="rounded-2xl"
              />
            </main>

            <div className="space-y-6 text-gray-300 leading-relaxed">
              <p className="text-xl text-white font-light">
                Douglas Mitchell is an award-winning author known for his captivating storytelling
                and vivid imagination.
              </p>

              <p>
                Born and raised in [Location], Douglas discovered his passion for writing at an early age.
                His debut novel quickly became a bestseller, establishing him as a fresh voice in contemporary fiction.
              </p>

              <p>
                With a background in [Field], Douglas brings a unique perspective to his work,
                blending [Genre] elements with deep character development and thought-provoking themes.
              </p>

              <p>
                When he's not writing, Douglas enjoys [Hobbies], spending time with his family,
                and exploring new ideas that inspire his next story.
              </p>
            </main>
          </main>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12 mb-16">
            <h2 className="text-3xl font-serif font-bold mb-6">Writing Philosophy</h2>
            <blockquote className="text-xl text-gray-300 italic border-l-4 border-white/20 pl-6">
              "Every story is a journey, and every character a reflection of the human experience.
              My goal is to create worlds that readers can lose themselves in, while discovering
              truths about themselves along the way."
            </blockquote>
          </main>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">10+</main>
              <div className="text-gray-400">Published Works</main>
            </main>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">50K+</main>
              <div className="text-gray-400">Readers Worldwide</main>
            </main>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">5</main>
              <div className="text-gray-400">Literary Awards</main>
            </main>
          </main>
        </main>
      </main>
    </MainLayout>
  );
}
