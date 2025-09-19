// src/pages/PlansPage.jsx - VERSIÓN FINAL, COMPLETA Y MULTILINGÜE

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';

const PlanCard = ({ plan }) => {
  const { lang } = useParams();
  
  // Lógica para decidir a dónde apunta el botón
  const getCtaLink = () => {
    if (plan.id === 'free') {
      return `/${lang}/login`; // El plan gratuito lleva al login/registro
    }
    // Para los planes de pago, de momento no enlazamos a ningún sitio funcional
    return "#"; 
  };

  // Función para mostrar una alerta en los planes de pago
  const handlePaidPlanClick = (e) => {
    if (plan.id !== 'free') {
      e.preventDefault(); // Prevenimos la navegación del enlace "#"
      alert("¡Gracias por tu interés! Los planes de pago estarán disponibles próximamente.");
    }
  };

  return (
    <div className={`flex flex-col p-6 rounded-lg shadow-lg ${plan.featured ? 'bg-blue-600 text-white' : 'bg-white'}`}>
        <h3 className={`text-2xl font-bold ${plan.featured ? '' : 'text-gray-900'}`}>{plan.name}</h3>
        <p className={`mt-2 ${plan.featured ? 'text-blue-200' : 'text-gray-500'}`}>{plan.description}</p>
        
        <div className="my-8">
            <span className={`text-5xl font-extrabold ${plan.featured ? '' : 'text-gray-900'}`}>{plan.price}</span>
            <span className={`text-base font-medium ${plan.featured ? 'text-blue-200' : 'text-gray-500'}`}>{plan.period}</span>
        </div>

        <ul className="space-y-4 mb-8">
            {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                    <span className={`material-symbols-outlined ${plan.featured ? 'text-white' : 'text-green-500'}`}>check_circle</span>
                    <span>{feature}</span>
                </li>
            ))}
        </ul>

        <Link 
            to={getCtaLink()} 
            onClick={handlePaidPlanClick}
            className={`mt-auto block w-full text-center rounded-lg px-6 py-3 text-base font-semibold ${plan.featured ? 'bg-white text-blue-600 hover:bg-gray-100' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
        >
            {plan.cta}
        </Link>
    </div>
  );
};


function PlansPage() {
  const { t } = useTranslation();

  // Los datos de los planes se construyen usando las claves de traducción
  const plans = [
    {
      id: 'free',
      name: t('plan_free_name'),
      description: t('plan_free_desc'),
      price: t('plan_free_price'),
      period: t('plan_free_period'),
      features: [
        t('plan_free_feature_1'),
        t('plan_free_feature_2'),
        t('plan_free_feature_3')
      ],
      cta: t('plan_free_cta'),
      featured: false,
    },
    {
      id: 'pro',
      name: t('plan_pro_name'),
      description: t('plan_pro_desc'),
      price: t('plan_pro_price'),
      period: t('plan_pro_period'),
      features: [
        t('plan_pro_feature_1'),
        t('plan_pro_feature_2'),
        t('plan_pro_feature_3'),
        t('plan_pro_feature_4'),
        t('plan_pro_feature_5')
      ],
      cta: t('plan_pro_cta'),
      featured: true,
    },
    {
      id: 'enterprise',
      name: t('plan_enterprise_name'),
      description: t('plan_enterprise_desc'),
      price: t('plan_enterprise_price'),
      period: t('plan_enterprise_period'),
      features: [
        t('plan_enterprise_feature_1'),
        t('plan_enterprise_feature_2'),
        t('plan_enterprise_feature_3'),
        t('plan_enterprise_feature_4'),
        t('plan_enterprise_feature_5')
      ],
      cta: t('plan_enterprise_cta'),
      featured: false,
    }
  ];

  return (
    <div className="py-12 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-extrabold text-gray-900">{t('plans_page_title')}</h1>
        <p className="mt-4 text-lg text-gray-600">{t('plans_page_subtitle')}</p>
      </div>

      <div className="mt-12 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map(plan => <PlanCard key={plan.name} plan={plan} />)}
      </div>
    </div>
  );
}

export default PlansPage;