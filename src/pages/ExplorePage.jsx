// src/pages/ExplorePage.jsx - VERSIÓN FINAL Y COMPLETA CON FILTROS TRADUCIDOS

import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase/config.js';
import { collection, query, orderBy, where, limit, startAfter, getDocs } from 'firebase/firestore';
import { Link, useSearchParams, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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

    const [filters, setFilters] = useState({
        category: searchParams.get('category') || 'All',
        sortBy: searchParams.get('sort') || 'createdAt',
    });

    const categoriesObject = t('categories', { returnObjects: true }) || {};
    const categoriesList = Object.entries(categoriesObject);

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        
        const newSearchParams = new URLSearchParams();
        if (newFilters.category !== 'All') newSearchParams.set('category', newFilters.category);
        if (newFilters.sortBy !== 'createdAt') newSearchParams.set('sort', newFilters.sortBy);
        
        setSearchParams(newSearchParams, { replace: true });
    };

    const fetchDesigns = useCallback(async (loadMore = false) => {
        if (!loadMore) {
            setLoading(true);
            setHasMore(true);
        } else {
            if (!hasMore || loadingMore || !lastDoc) return;
            setLoadingMore(true);
        }

        try {
            const queryConstraints = [
                collection(db, "designs"),
                where("public", "==", true),
                orderBy(filters.sortBy, "desc"),
            ];
            
            if (filters.category !== 'All') {
                queryConstraints.splice(2, 0, where("category", "==", filters.category));
            }

            if (loadMore && lastDoc) {
                queryConstraints.push(startAfter(lastDoc));
            }
            queryConstraints.push(limit(PAGE_SIZE));
            
            const q = query(...queryConstraints);
            const documentSnapshots = await getDocs(q);

            const newDesigns = documentSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            if (loadMore) {
                setDesigns(prev => [...prev, ...newDesigns]);
            } else {
                setDesigns(newDesigns);
            }

            const lastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1];
            setLastDoc(lastVisible);

            if (documentSnapshots.docs.length < PAGE_SIZE) {
                setHasMore(false);
            }

        } catch (error) {
            console.error("Error fetching designs:", error);
        }

        if (loadMore) {
            setLoadingMore(false);
        } else {
            setLoading(false);
        }
    }, [filters, lastDoc, hasMore, loadingMore]);

    useEffect(() => {
        fetchDesigns(false);
    }, [filters, fetchDesigns]);

    return (
        <main className="p-4">
            <h2 className="text-text-primary text-3xl font-bold tracking-tight mb-4">{t('explore_page_title')}</h2>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <label htmlFor="category-filter" className="sr-only">{t('explore_filter_category')}</label>
                    <select 
                        id="category-filter"
                        value={filters.category} 
                        onChange={(e) => handleFilterChange('category', e.target.value)} 
                        className="w-full appearance-none rounded-lg border-gray-300 bg-white py-3 pl-4 pr-10 text-base text-text-primary shadow-sm focus:border-public-primary focus:outline-none focus:ring-1 focus:ring-public-primary"
                    >
                        <option value="All">{t('explore_filter_all_categories')}</option>
                        {categoriesList.map(([key, value]) => <option key={key} value={key}>{value}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="material-symbols-outlined text-text-secondary">expand_more</span>
                    </div>
                </div>
                <div className="relative flex-1">
                    <label htmlFor="sort-by" className="sr-only">{t('explore_sort_by')}</label>
                    <select 
                        id="sort-by"
                        value={filters.sortBy} 
                        onChange={(e) => handleFilterChange('sortBy', e.target.value)} 
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
                        onClick={() => fetchDesigns(true)} 
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