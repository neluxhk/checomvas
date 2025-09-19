// src/pages/ExplorePage.jsx - VERSIÓN FINAL, ESTABLE Y CON URLS DINÁMICAS

import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config.js';
import { collection, query, orderBy, where, limit, startAfter, getDocs } from 'firebase/firestore';
import { Link, useSearchParams, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const CATEGORIES = ["Downlight", "Linear", "Spotlight", "Pendant", "Wall Washer", "Gobo", "Otro"];

const PublicDesignCard = ({ design }) => {
  const { lang } = useParams();
  return (
    <Link className="group block" to={`/${lang}/diseno/${design.id}`}>
        <div className="overflow-hidden rounded-lg shadow-md transition-shadow duration-300 group-hover:shadow-xl">
            <div 
                className="w-full bg-cover bg-center aspect-square transition-transform duration-300 group-hover:scale-105" 
                style={{ backgroundImage: `url(${design.imageUrl})` }} 
            />
        </div>
        <div className="pt-3">
            <h3 className="text-text-primary font-semibold leading-tight truncate">{design.title}</h3>
            <p className="text-sm text-text-secondary">{design.category || ''}</p>
        </div>
    </Link>
  );
};

const PAGE_SIZE = 8;

function ExplorePage() {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();

    const [designs, setDesigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [lastDoc, setLastDoc] = useState(null);
    const [hasMore, setHasMore] = useState(true);

    // El estado de los filtros se inicializa desde la URL
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
    const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'createdAt');

    const fetchFirstPage = async (category, sort) => {
        setLoading(true);
        setHasMore(true);
        setDesigns([]);
        try {
            const queryConstraints = [
                collection(db, "designs"),
                where("public", "==", true),
                orderBy(sort, "desc"),
                limit(PAGE_SIZE)
            ];
            if (category !== 'All') {
                queryConstraints.splice(2, 0, where("category", "==", category));
            }
            const q = query(...queryConstraints);
            const documentSnapshots = await getDocs(q);
            const newDesigns = documentSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setDesigns(newDesigns);
            const lastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1];
            setLastDoc(lastVisible);
            if (documentSnapshots.docs.length < PAGE_SIZE) {
                setHasMore(false);
            }
        } catch (error) {
            console.error("Error fetching designs:", error);
        }
        setLoading(false);
    };

    const fetchMoreDesigns = async () => {
        if (!hasMore || loadingMore || !lastDoc) return;
        setLoadingMore(true);
        try {
            const queryConstraints = [
                collection(db, "designs"),
                where("public", "==", true),
                orderBy(sortBy, "desc"),
                startAfter(lastDoc),
                limit(PAGE_SIZE)
            ];
            if (selectedCategory !== 'All') {
                queryConstraints.splice(2, 0, where("category", "==", selectedCategory));
            }
            const q = query(...queryConstraints);
            const documentSnapshots = await getDocs(q);
            const newDesigns = documentSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setDesigns(prevDesigns => [...prevDesigns, ...newDesigns]);
            const lastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1];
            setLastDoc(lastVisible);
            if (documentSnapshots.docs.length < PAGE_SIZE) {
                setHasMore(false);
            }
        } catch (error) {
            console.error("Error fetching more designs:", error);
        }
        setLoadingMore(false);
    };

    // useEffect se dispara cuando los filtros cambian en el estado
    useEffect(() => {
        fetchFirstPage(selectedCategory, sortBy);
    }, [selectedCategory, sortBy]);

    // Función para manejar el cambio en los desplegables
    const handleCategoryChange = (e) => {
        const newCategory = e.target.value;
        setSelectedCategory(newCategory);
        // Actualizamos la URL
        if (newCategory === 'All') {
            searchParams.delete('category');
        } else {
            searchParams.set('category', newCategory);
        }
        setSearchParams(searchParams, { replace: true });
    };

    const handleSortChange = (e) => {
        const newSortBy = e.target.value;
        setSortBy(newSortBy);
        // Actualizamos la URL
        if (newSortBy === 'createdAt') {
            searchParams.delete('sort');
        } else {
            searchParams.set('sort', newSortBy);
        }
        setSearchParams(searchParams, { replace: true });
    };

    return (
        <main className="p-4">
            <h2 className="text-text-primary text-3xl font-bold tracking-tight mb-4">{t('explore_page_title')}</h2>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <label htmlFor="category-filter" className="sr-only">{t('explore_filter_category')}</label>
                    <select 
                        id="category-filter"
                        value={selectedCategory} 
                        onChange={handleCategoryChange} 
                        className="w-full appearance-none rounded-lg border-gray-300 bg-white py-3 pl-4 pr-10 text-base text-text-primary shadow-sm focus:border-public-primary focus:outline-none focus:ring-1 focus:ring-public-primary"
                    >
                        <option value="All">{t('explore_filter_all_categories')}</option>
                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="material-symbols-outlined text-text-secondary">expand_more</span>
                    </div>
                </div>
                <div className="relative flex-1">
                    <label htmlFor="sort-by" className="sr-only">{t('explore_sort_by')}</label>
                    <select 
                        id="sort-by"
                        value={sortBy} 
                        onChange={handleSortChange} 
                        className="w-full appearance-none rounded-lg border-gray-300 bg-white py-3 pl-4 pr-10 text-base text-text-primary shadow-sm focus:border-public-primary focus:outline-none focus:ring-1 focus:ring-public-primary"
                    >
                        <option value="createdAt">{t('explore_sort_recent')}</option>
                        <option value="views">{t('explore_sort_views')}</option>
                        <option value="favoritesCount">{t('explore_sort_favorites')}</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="material-symbols-outlined text-text-secondary">expand_more</span>
                    </div>
                </div>
            </div>

            {loading ? (
                <p className="text-center py-12 font-semibold text-gray-500">{t('explore_loading')}</p>
            ) : designs.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                    {designs.map(design => (
                        <PublicDesignCard key={design.id} design={design} />
                    ))}
                </div>
            ) : (
                <p className="text-center py-12 font-semibold text-gray-500">{t('explore_no_results')}</p>
            )}
            
            <div className="mt-10 text-center">
                {hasMore && !loading && (
                    <button 
                        onClick={fetchMoreDesigns} 
                        disabled={loadingMore} 
                        className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loadingMore ? t('explore_loading_more') : t('explore_load_more')}
                    </button>
                )}
                {!hasMore && !loading && designs.length > 0 && (
                    <p className="text-gray-500">{t('explore_end_of_list')}</p>
                )}
            </div>
        </main>
    );
}

export default ExplorePage;