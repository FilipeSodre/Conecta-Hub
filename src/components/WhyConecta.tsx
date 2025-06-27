import React from 'react';

const HandshakeIcon: React.FC = () => (
  <svg className="w-7 h-7 text-gray-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5" />
    <path d="M13 7a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-5" />
    <path d="m12 12-2-2-2 2" />
    <path d="m12 12 2 2 2-2" />
  </svg>
);

const EyeIcon: React.FC = () => (
  <svg className="w-7 h-7 text-gray-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const BrainIcon: React.FC = () => (
  <svg className="w-7 h-7 text-gray-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11.5 16.5c-1.25 0-2.5-.5-3.5-1.5s-1.5-2.5-1.5-3.5 1-3.5 3-4.5c1-.5 2-1.5 2-2.5C11.5 3.5 10.5 3 10.5 3S8.5 4 7.5 6C5.5 10 9 17 14 17c2 0 4-1 5-2.5s.5-3.5-1-5c-1-1-2.5-1-3.5-.5l-1 2.5" />
    <circle cx="10" cy="10" r="1.5" />
    <path d="M10 8.5v-1m0 4v-1m1.5-1.5h1m-4 0h-1m1.061-1.061l.707-.707m-2.122 2.122l-.707-.707m2.122 0l.707.707m-2.122-2.122l-.707.707" strokeLinecap="round" />
    <circle cx="13" cy="7" r="1" />
  </svg>
);

const features = [
  { icon: <HandshakeIcon />, text: 'Parcerias de sucesso' },
  { icon: <EyeIcon />, text: 'Divulgação do seu trabalho' },
  { icon: <BrainIcon />, text: 'Aprendizagem de forma prática e fácil' },
];

const WhyConecta: React.FC = () => {
  return (
    <div className="w-full max-w-xl rounded-2xl shadow-card overflow-hidden flex flex-col sm:flex-row font-nunito mx-auto">
      <div className="w-full sm:w-2/5 bg-black flex flex-col justify-center items-center p-6 sm:p-8 text-center">
        <div className="space-y-2">
          <h2 className="font-indie-flower text-2xl sm:text-3xl text-white leading-tight">
            Por que usar a
          </h2>
          <h2 className="font-indie-flower text-4xl sm:text-5xl font-bold text-[#FDE047]">
            Conecta?
          </h2>
        </div>
      </div>
      <div className="w-full sm:w-3/5 bg-[#4F2C7A] flex flex-col justify-center p-6 sm:p-8">
        <ul className="space-y-5">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-4">
              <div className="bg-white rounded-xl p-2 flex-shrink-0 shadow-md">
                {feature.icon}
              </div>
              <p className="text-white text-base sm:text-lg font-medium font-nunito">
                {feature.text}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default WhyConecta;
