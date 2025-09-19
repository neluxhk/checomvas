import React from 'react';
const designs = [
{ title: 'Iluminación Residencial', description: 'Transforma hogares con soluciones de iluminación a medida.', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkZeV9Af2GioV0DwoL-1jWloSRpSfbh3zWJCj0BcxkmenIXcLwWqMX9xrYPByyAp0rmOLmsxApXGr0Eds2pXy9R2YjyNrz_lZL74o5X6D0zzRHho1RtHtXOpUC2acapjzVOrTYAmaGNDZ9uMrxc0g_2Hval7s1KttnoOPWFRWj0C3Lw4PJlUp6vBkaMf7PiaPeuNvpxRtjoME4kSEwEz51faI06qdrOAv-VSkJEPrfIyuilcXH3lEgfJrt-Yt5oTn1Xr62Z2RO-bA' },
{ title: 'Iluminación Comercial', description: 'Mejora los espacios de trabajo con diseños de iluminación innovadores.', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUKhcFcwuJxGdA6Qx029QmVJqUwc0-3Ver7VvSD7E6U9yX721edudMotQJxP6sEIKVPcsXaFxcpQkZWcGYE8xynPHFaQ4dacgqso29V5TDApwM5P5fXBz8-8DCmki9SlHimxJLljpZ7Glg_Dh8CaGuTiyTFKzRgsVma47irFomsX9AiiccTDMc-F9u19UstFkKrkf7SynUP_gopBaR5v9WsRIzC5nH7SEbBOr2Muw3DGLPg7MQo23lStYtux-3lBcd2Yo79aaio9k' },
{ title: 'Iluminación para Hotelería', description: 'Crea experiencias memorables con una iluminación impresionante.', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBY7rsTA5PZlZoHWzQrSTDQlTRZJZo7ta7aWtRi1cvMSPVGBSEgJEa-c6ZCzA2GFEMrUspCak52UJxrwATqtouu0OmvhBBiHJj9g9tYqSN9EjVBN1TC-pmcmhCYSAsJqXFw6WBDosAQmAgljDBQDsyCJkJMWDMjTguX34ag6D9oRtT0sM2KrS21EUaxj-Stl14zJSRFndJW0WcItGLvYIn_SW7xErbFuLmkHj_VDqGva-W89MMbyn9eU-qXi3_dhzREsCTCbyYZMsY' }
];
const DesignCard = ({ title, description, imageUrl }) => (
<div className="flex h-full flex-col gap-4 rounded-xl shadow-sm bg-white overflow-hidden w-72 snap-center shrink-0">
<div className="w-full bg-center bg-no-repeat aspect-video bg-cover" style={{ backgroundImage: `url("${imageUrl}")` }}></div>
<div className="p-4">
<p className="text-lg font-semibold leading-normal">{title}</p>
<p className="text-gray-500 text-sm font-normal leading-normal">{description}</p>
</div>
</div>
);
function FeaturedDesigns() {
return (
<section className="py-12 md:py-20 px-4">
<h2 className="text-3xl font-bold leading-tight tracking-tight text-center mb-10">Diseños Destacados</h2>
<div className="flex overflow-x-auto snap-x snap-mandatory [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-4 -mx-4 px-4 justify-center">
<div className="flex items-stretch gap-6">
{designs.map(design => <DesignCard key={design.title} {...design} />)}
</div>
</div>
</section>
);
}
export default FeaturedDesigns;