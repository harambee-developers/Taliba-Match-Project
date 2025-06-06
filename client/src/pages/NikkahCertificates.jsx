import React from 'react';
import { FaDownload } from 'react-icons/fa';

// Import PDF files
import goldenCertificate from '../assets/nikkahCertificates/Golden+Nikah+Certificate+-+Editable+-+Talibah.pdf';
import greenFloralCertificate from '../assets/nikkahCertificates/Green+Floral+Nikah+Certificate+-+Editable+-+Talibah.pdf';
import silverCertificate from '../assets/nikkahCertificates/Silver+Nikah+Certificate+Blank+-+Editable+-+Talibah.pdf';
import blueFloralCertificate from '../assets/nikkahCertificates/Blue+Floral+Nikah+Certificate+-+Editable+-+Talibah.pdf';
import parchmentCertificate from '../assets/nikkahCertificates/Parchment+Nikah+Certificate+-+Editable+-+Talibah.pdf';
import cherryBlossomCertificate from '../assets/nikkahCertificates/Cherry+Blosson+Nikah+Certificate+-+Editable+-+Talibah.pdf';

// Import preview images
import goldenPreview from '../assets/nikkahCertificates/previews/golden-preview.jpg';
import greenFloralPreview from '../assets/nikkahCertificates/previews/green-floral-preview.jpg';
import silverPreview from '../assets/nikkahCertificates/previews/silver-preview.jpg';
import blueFloralPreview from '../assets/nikkahCertificates/previews/blue-floral-preview.jpg';
import parchmentPreview from '../assets/nikkahCertificates/previews/parchment-preview.jpg';
import cherryBlossomPreview from '../assets/nikkahCertificates/previews/cherry-blossom-preview.jpg';

const certificates = [
  {
    title: "Golden Nikkah Certificate",
    description: "A beautiful golden-themed certificate for your special day",
    file: goldenCertificate,
    preview: goldenPreview
  },
  {
    title: "Green Floral Nikkah Certificate",
    description: "Elegant green floral design perfect for spring weddings",
    file: greenFloralCertificate,
    preview: greenFloralPreview
  },
  {
    title: "Silver Nikkah Certificate",
    description: "Classic silver design with a modern touch",
    file: silverCertificate,
    preview: silverPreview
  },
  {
    title: "Blue Floral Nikkah Certificate",
    description: "Stunning blue floral pattern for a serene ceremony",
    file: blueFloralCertificate,
    preview: blueFloralPreview
  },
  {
    title: "Parchment Nikkah Certificate",
    description: "Traditional parchment style for a timeless look",
    file: parchmentCertificate,
    preview: parchmentPreview
  },
  {
    title: "Cherry Blossom Nikkah Certificate",
    description: "Delicate cherry blossom design for a romantic ceremony",
    file: cherryBlossomCertificate,
    preview: cherryBlossomPreview
  }
];

const CertificateCard = ({ title, description, file, preview }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105">
    <div className="relative aspect-[3/4] overflow-hidden">
      <img 
        src={preview} 
        alt={title}
        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
      />
    </div>
    <div className="p-6">
      <h3 className="text-xl font-semibold text-[#14485A] mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <a
        href={file}
        download
        className="inline-flex items-center gap-2 bg-[#14485A] text-white px-4 py-2 rounded-lg hover:bg-[#0d3442] transition-colors"
      >
        <FaDownload />
        Download Certificate
      </a>
    </div>
  </div>
);

const NikkahCertificates = () => {
  return (
    <div className="min-h-screen theme-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-[#14485A]">Nikkah Certificates</h1>
          <p className="text-lg max-w-3xl mx-auto text-gray-600">
            Download beautiful, editable Nikkah certificates for your special day. These certificates are for ceremonial and personal keepsake purposes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((certificate, index) => (
            <CertificateCard
              key={index}
              title={certificate.title}
              description={certificate.description}
              file={certificate.file}
              preview={certificate.preview}
            />
          ))}
        </div>

        <div className="mt-12 bg-white rounded-lg p-6 shadow-md">
          <h2 className="text-2xl font-semibold text-[#14485A] mb-4">How To Use The Certificate</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-600">
            <li>Choose a design from the options above and click <strong>Download</strong></li>
            <li>The file will download as a <strong>PDF</strong></li>
            <li>Open the file in any <strong>PDF reader</strong> — we recommend <strong>Adobe Acrobat</strong> (free on all devices)</li>
            <li>Click into the provided spaces to <strong>type your information</strong>, such as the names and date</li>
            <li>You can <strong>save the filled-in version</strong> and then print it — or print it blank and write by hand</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default NikkahCertificates; 