import { MainLayout } from "@/components/main-layout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Press Kit | Douglas Mitchell Author",
  description: "Download high-resolution photos, biography, and press materials for Douglas Mitchell.",
};

export default function PressKitPage() {
  const downloads = [
    {
      title: "Author Biography",
      description: "Complete biographical information and career highlights",
      format: "PDF",
      size: "245 KB",
    },
    {
      title: "High-Resolution Photos",
      description: "Professional headshots and author photos",
      format: "ZIP",
      size: "12.3 MB",
    },
    {
      title: "Book Covers",
      description: "High-resolution book cover images",
      format: "ZIP",
      size: "8.7 MB",
    },
    {
      title: "Press Release Template",
      description: "Customizable press release for events",
      format: "DOCX",
      size: "156 KB",
    },
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-black text-white py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-8">
            Press Kit
          </h1>
          
          <p className="text-xl text-gray-300 mb-16 leading-relaxed">
            Download professional materials for media coverage, interviews, 
            and promotional use. All materials are available for editorial use.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {downloads.map((item, index) => (
              <div 
                key={index}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors"
              >
                <h3 className="text-xl font-serif font-bold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-300 mb-4">{item.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">
                    {item.format} • {item.size}
                  </span>
                  <button className="bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors">
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-16">
            <h2 className="text-3xl font-serif font-bold mb-6">Quick Facts</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Author Details</h3>
                <ul className="space-y-2 text-gray-300">
                  <li><strong>Full Name:</strong> Douglas Mitchell</li>
                  <li><strong>Genre:</strong> Contemporary Fiction</li>
                  <li><strong>Debut:</strong> 2018</li>
                  <li><strong>Awards:</strong> 5 Literary Awards</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Latest Work</h3>
                <ul className="space-y-2 text-gray-300">
                  <li><strong>Title:</strong> [Latest Book Title]</li>
                  <li><strong>Publisher:</strong> [Publisher Name]</li>
                  <li><strong>Release:</strong> [Release Date]</li>
                  <li><strong>ISBN:</strong> [ISBN Number]</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h2 className="text-3xl font-serif font-bold mb-4">Media Inquiries</h2>
            <p className="text-gray-300 mb-6">
              For interviews, review copies, or additional materials, please contact 
              our media relations team. We respond to all inquiries within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="mailto:press@douglasmitchell.com" 
                className="inline-block bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-center"
              >
                Email Press Team
              </a>
              <a 
                href="/contact" 
                className="inline-block border border-white/20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors text-center"
              >
                General Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}