
const Privacy = () => {

  return (
    <div className="max-w-4xl mx-auto p-6 bg-background text-forground font-sans">
      <section className="space-y-4">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="text-sm text-slate-500">Last Updated: April 7, 2026</p>
        <div>
          <h2 className="text-xl font-semibold">1. Our Privacy Commitment</h2>
          <p className='text-sm text-gray-400'>At UFL (Discipline Architect), your privacy is our primary concern. We do not sell, rent, or trade your personal data to any third parties for marketing purposes.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold">2. Data Collection & AI Usage</h2>
          <p className='text-sm text-gray-400'>We collect information necessary to track your habits and tasks. This includes:</p>
          <ul className="list-disc ml-6 text-gray-400">
            <li><strong>Manual Data:</strong> Tasks and habits you create yourself are stored securely and are not processed by AI unless requested.</li>
            <li><strong>AI-Generated Content:</strong> If you opt-in to use our AI LLM features to generate "Paths" or "Todo Lists," the specific prompt you provide is processed by our AI provider (e.g., Google Gemini) to generate your schedule.</li>
            <li><strong>Integrations:</strong> Data from WakaTime, GitHub, or WhatsApp is used solely to populate your dashboard and send you personal notifications.</li>
          </ul>
        </div>
        <div>
          <h2 className="text-xl font-semibold ">3. Third-Party Services</h2>
          <p className='text-sm text-gray-400'>We use Meta (Facebook) for authentication and LLM providers for task generation. These services receive only the data required to perform their specific functions.</p>
        </div>
      </section>
    </div>
  );
};

export default Privacy;