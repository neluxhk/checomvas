import React from 'react';

const BenefitCard = ({ icon, title, text }) => (
  <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-6 text-center items-center">
    <div className="text-blue-600 bg-blue-100 p-3 rounded-full">
      <span className="material-symbols-outlined text-3xl">{icon}</span>
    </div>
    <h3 className="text-lg font-bold leading-tight">{title}</h3>
    <p className="text-gray-600 text-sm font-normal leading-normal">{text}</p>
  </div>
);

function BenefitsSection({ title, description, items, isBgWhite = false }) {
  const sectionClasses = `py-12 md:py-20 px-4 ${isBgWhite ? 'bg-white' : ''}`;
  
  return (
    <section className={sectionClasses}>
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold leading-tight tracking-tight mb-4">{title}</h2>
        <p className="text-lg text-gray-600 mb-10">{description}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {items.map(item => <BenefitCard key={item.title} {...item} />)}
      </div>
    </section>
  );
}

export default BenefitsSection;