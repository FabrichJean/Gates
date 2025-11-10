/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { apiURL } from "../constant";
import { getToken } from "../utils/storage";
import useCategoryPost from "../hooks/posts/useCategoryPost";
import useSubCategoryPost from "../hooks/posts/useSubCategoryPost";
import UsePlateform from "../hooks/usePlateform";
import { useNavigate } from "react-router-dom";

const UploadPost = () => {
    const navigate = useNavigate();
    
    // Hook pour récupérer les catégories
    const { data: categoriesResponse, loading: categoriesLoading, error: categoriesError } = useCategoryPost();

    // Hook pour récupérer les plateformes (Web Apps)
    const { data: plateformsData, loading: plateformsLoading, error: plateformsError } = UsePlateform();

    const [languages, setLanguages] = useState([
        { id: 1, name: "中文" },
        { id: 2, name: "English" },
    ]);
    const [open, setOpen] = useState(false);
    const [subOpen, setSubOpen] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<{ id: number, name: string } | null>(null);

    // Hook pour récupérer les sous-catégories basées sur la catégorie sélectionnée
    const { data: subCategories, loading: subCategoriesLoading, error: subCategoriesError } = useSubCategoryPost(selectedCategory?.id);

    const [selectedSubCategory, setSelectedSubCategory] = useState<{ id: number, name: string, categoryId: number } | null>(null);
    const [selectedWebApp, setSelectedWebApp] = useState<{ id: number, name: string } | null>(null);
    const [webAppOpen, setWebAppOpen] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState<{ id: number, name: string }>({ id: 1, name: "中文" }); // Default to first language
    const [titles, setTitles] = useState<{ [key: number]: string }>({});
    const [descriptions, setDescriptions] = useState<{ [key: number]: string }>({});
    const [imageFields, setImageFields] = useState<{ id: number, file: File | null }[]>([{ id: 1, file: null }]);
    const [videoFields, setVideoFields] = useState<{ id: number, file: File | null }[]>([{ id: 1, file: null }]);
    const [showAddLanguageModal, setShowAddLanguageModal] = useState(false);
    const [newLanguageName, setNewLanguageName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Refs pour détecter les clics à l'extérieur
    const categoryDropdownRef = useRef<HTMLDivElement>(null);
    const subCategoryDropdownRef = useRef<HTMLDivElement>(null);
    const webAppDropdownRef = useRef<HTMLDivElement>(null);

    // Les sous-catégories sont automatiquement filtrées par le hook
    const availableSubCategories = subCategories;

    // Effet pour fermer les menus lors du clic à l'extérieur
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Fermer le menu catégorie si clic à l'extérieur
            if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
            // Fermer le menu sous-catégorie si clic à l'extérieur
            if (subCategoryDropdownRef.current && !subCategoryDropdownRef.current.contains(event.target as Node)) {
                setSubOpen(false);
            }
            // Fermer le menu Web App si clic à l'extérieur
            if (webAppDropdownRef.current && !webAppDropdownRef.current.contains(event.target as Node)) {
                setWebAppOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Effet pour s'assurer que selectedLanguage est toujours valide
    useEffect(() => {
        if (!languages.find(lang => lang.id === selectedLanguage.id)) {
            setSelectedLanguage(languages[0]);
        }
    }, [languages, selectedLanguage.id]);

    // Effet pour réinitialiser les sélections si les catégories changent ou en cas d'erreur
    useEffect(() => {
        if (categoriesError) {
            setSelectedCategory(null);
            setSelectedSubCategory(null);
            setSelectedOptions([]);
        }
    }, [categoriesError]);

    // Effet pour réinitialiser la sous-catégorie en cas d'erreur ou changement de catégorie
    useEffect(() => {
        if (subCategoriesError || !selectedCategory) {
            setSelectedSubCategory(null);
        }
    }, [subCategoriesError, selectedCategory]);

    // Effet pour réinitialiser la sélection Web App en cas d'erreur
    useEffect(() => {
        if (plateformsError) {
            setSelectedWebApp(null);
        }
    }, [plateformsError]);

    // Fonctions pour gérer les titres et descriptions par langue
    const handleTitleChange = (languageId: number, value: string) => {
        setTitles(prev => ({ ...prev, [languageId]: value }));
    };

    const handleDescriptionChange = (languageId: number, value: string) => {
        setDescriptions(prev => ({ ...prev, [languageId]: value }));
    };

    // Fonction pour ajouter une nouvelle langue
    const handleAddLanguage = () => {
        if (newLanguageName.trim()) {
            const newId = Math.max(...languages.map(lang => lang.id)) + 1;
            const newLanguage = { id: newId, name: newLanguageName.trim() };
            setLanguages(prev => [...prev, newLanguage]);
            setNewLanguageName("");
            setShowAddLanguageModal(false);
            setSelectedLanguage(newLanguage); // Sélectionner automatiquement la nouvelle langue
        }
    };

    // Fonction pour annuler l'ajout de langue
    const handleCancelAddLanguage = () => {
        setNewLanguageName("");
        setShowAddLanguageModal(false);
    };

    // Fonctions pour gérer les champs d'images
    const addImageField = () => {
        const newId = Math.max(...imageFields.map(field => field.id)) + 1;
        setImageFields(prev => [...prev, { id: newId, file: null }]);
    };

    const removeImageField = (id: number) => {
        if (imageFields.length > 1) {
            setImageFields(prev => prev.filter(field => field.id !== id));
        }
    };

    const handleImageChange = (id: number, file: File | null) => {
        // Ne mettre à jour que si un fichier est effectivement sélectionné
        if (file) {
            setImageFields(prev => prev.map(field =>
                field.id === id ? { ...field, file } : field
            ));
        }
    };

    // Fonctions pour gérer les champs de vidéos
    const addVideoField = () => {
        const newId = Math.max(...videoFields.map(field => field.id)) + 1;
        setVideoFields(prev => [...prev, { id: newId, file: null }]);
    };

    const removeVideoField = (id: number) => {
        if (videoFields.length > 1) {
            setVideoFields(prev => prev.filter(field => field.id !== id));
        }
    };

    const handleVideoChange = (id: number, file: File | null) => {
        // Ne mettre à jour que si un fichier est effectivement sélectionné
        if (file) {
            // Vérifier la taille du fichier vidéo (2GB max = 2 * 1024 * 1024 * 1024 bytes)
            const maxSize = 2 * 1024 * 1024 * 1024; // 2GB en bytes
            if (file.size > maxSize) {
                toast.error(`⚠️ La vidéo est trop volumineuse !\n\nTaille du fichier: ${(file.size / 1024 / 1024 / 1024).toFixed(2)} GB\nTaille maximum autorisée: 2 GB\n\nVeuillez choisir une vidéo plus petite.`);
                return;
            }

            setVideoFields(prev => prev.map(field =>
                field.id === id ? { ...field, file } : field
            ));
        }
    };

    // Fonction pour réinitialiser le formulaire
    const handleResetForm = () => {
        setSelectedCategory(null);
        setSelectedSubCategory(null);
        setSelectedWebApp(null);
        setSelectedOptions([]);
        setTitles({});
        setDescriptions({});
        setImageFields([{ id: 1, file: null }]);
        setVideoFields([{ id: 1, file: null }]);
        setOpen(false);
        setSubOpen(false);
        setWebAppOpen(false);
        toast.success("Formulaire réinitialisé");
    };

    // Upload post avec useCallback
    const handleSubmit = useCallback(async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        // Validation des champs obligatoires
        if (!selectedCategory || !selectedSubCategory || !selectedWebApp) {
            toast.error("Veuillez remplir tous les champs obligatoires !");
            return;
        }

        // Vérifier qu'au moins un titre est renseigné
        const hasTitle = Object.values(titles).some(title => title.trim() !== "");
        if (!hasTitle) {
            toast.error("Veuillez saisir au moins un titre");
            return;
        }

        // Vérifier qu'au moins une image est sélectionnée
        const hasImages = imageFields.some(field => field.file !== null);
        if (!hasImages) {
            toast.error("Veuillez sélectionner au moins une image");
            return;
        }

        // Vérifier qu'au moins une vidéo est sélectionnée
        const hasVideos = videoFields.some(field => field.file !== null);
        if (!hasVideos) {
            toast.error("Veuillez sélectionner au moins une vidéo");
            return;
        }

        // Préparer les titres multilingues selon la nouvelle structure
        const titlesArray: { title: string, i18_language: string, description?: string }[] = [];

        languages.forEach(lang => {
            if (titles[lang.id]?.trim()) {
                // Utiliser le nom de la langue comme i18_language
                const langCode = lang.name.toLowerCase() === 'english' ? 'en' : 
                               lang.name.toLowerCase() === '中文' ? 'zh' : 
                               lang.name.toLowerCase() === 'français' ? 'fr' : 
                               lang.name.toLowerCase().substring(0, 2);
                
                titlesArray.push({
                    title: titles[lang.id].trim(),
                    i18_language: langCode,
                    ...(descriptions[lang.id]?.trim() && { description: descriptions[lang.id].trim() })
                });
            }
        });

        const formData = {
            category_id: selectedCategory.id,
            sub_category_id: selectedSubCategory.id,
            plateform_id: selectedWebApp.id,
            titles: JSON.stringify(titlesArray),
            videos: videoFields.filter(field => field.file).map(field => field.file),
            images: imageFields.filter(field => field.file).map(field => field.file),
        };

        try {
            setIsSubmitting(true);

            // Créer le FormData 
            const fd = new FormData();
            
            // Ajouter les données de base
            fd.append('category_id', formData.category_id.toString());
            fd.append('sub_category_id', formData.sub_category_id.toString());
            fd.append('plateform_id', formData.plateform_id.toString());
            fd.append('titles', formData.titles);

            // Ajouter les fichiers vidéos
            formData.videos.forEach((video) => {
                if (video) fd.append('videos', video);
            });

            // Ajouter les fichiers images
            formData.images.forEach((image) => {
                if (image) fd.append('images', image);
            });

            // @ts-ignore
            const response = await axios.post(`${apiURL}/posts/submit`, fd, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                },
                timeout: 10 * 60 * 1000 // 10 minutes timeout
            });

            toast.success("✅ Post uploadé avec succès !");
            navigate("/post");
            console.log("Post uploaded:", response.data);
            
            // Réinitialiser le formulaire
            setSelectedCategory(null);
            setSelectedSubCategory(null);
            setSelectedWebApp(null);
            setTitles({});
            setDescriptions({});
            setImageFields([{ id: 1, file: null }]);
            setVideoFields([{ id: 1, file: null }]);
            setSelectedOptions([]);
            
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error(err);
            toast.error("Erreur lors de l'upload : " + (err.response?.data?.message || err.message));
        } finally {
            setIsSubmitting(false);
        }
    }, [selectedCategory, selectedSubCategory, selectedWebApp, titles, descriptions, imageFields, videoFields, languages, navigate]);

    return (
        <div className="min-h-screen flex items-start pb-6">
            {/* contenu de l'upload */}
            <div className="flex w-full border border-gray-300 dark:border-gray-700 rounded-lg p-4 sm:p-6">
                <div className="w-full justify-start">
                    <h2 className="text-lg sm:text-xl font-semibold text-left text-gray-900 dark:text-white">Upload Post</h2>
                    <div className="mt-4">
                        {/* formulaire de l'upload */}
                        <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
                            {/* champ select de catégorie */}
                            <div className="relative w-full" ref={categoryDropdownRef}>
                                <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category:</label>
                                {categoriesError && (
                                    <div className="mb-2 text-sm text-red-600 dark:text-red-400">
                                        <span className="flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                            Erreur lors du chargement des catégories: {categoriesError}
                                        </span>
                                    </div>
                                )}
                                <div className="mt-1 relative w-full">
                                    <button
                                        type="button"
                                        onClick={() => !categoriesLoading && setOpen(!open)}
                                        disabled={categoriesLoading}
                                        className={`relative w-full border border-gray-300 dark:border-gray-600 rounded-md pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm ${categoriesLoading
                                                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                                            }`}>
                                        <span className="block truncate">
                                            {categoriesLoading
                                                ? 'Chargement des catégories...'
                                                : categoriesError
                                                    ? 'Erreur lors du chargement'
                                                    : selectedOptions.length
                                                        ? selectedOptions[0]
                                                        : 'Select category'
                                            }
                                        </span>
                                        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                            <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                                                fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd"
                                                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                                                    clipRule="evenodd" />
                                            </svg>
                                        </span>
                                    </button>

                                    {open && (
                                        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 dark:ring-gray-600 overflow-auto focus:outline-none sm:text-sm">
                                            {categoriesLoading ? (
                                                <div className="py-2 pl-3 pr-9 text-gray-500 dark:text-gray-400">
                                                    Chargement des catégories...
                                                </div>
                                            ) : categoriesError ? (
                                                <div className="py-2 pl-3 pr-9 text-red-500 dark:text-red-400">
                                                    Erreur: {categoriesError}
                                                </div>
                                            ) : categoriesResponse?.categories?.length === 0 ? (
                                                <div className="py-2 pl-3 pr-9 text-gray-500 dark:text-gray-400">
                                                    Aucune catégorie disponible
                                                </div>
                                            ) : (
                                                categoriesResponse?.categories?.map((cat) => (
                                                    <div key={cat.id} onClick={() => {
                                                        setSelectedOptions([cat.name]);
                                                        setSelectedCategory({ id: cat.id, name: cat.name });
                                                        setSelectedSubCategory(null); // Reset sub-category when category changes
                                                        setOpen(false);
                                                    }}
                                                        className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-600 hover:text-white text-gray-900 dark:text-white dark:hover:bg-indigo-500">
                                                        <span className={`block truncate ${selectedOptions[0] === cat.name ? 'font-semibold' : ''}`}>
                                                            {cat.name}
                                                        </span>
                                                        {selectedOptions[0] === cat.name && (
                                                            <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600 dark:text-indigo-400 hover:text-white">
                                                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                                                                    fill="currentColor">
                                                                    <path fillRule="evenodd"
                                                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                        clipRule="evenodd" />
                                                                </svg>
                                                            </span>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* champ select de sous-catégorie */}
                            <div className="relative w-full" ref={subCategoryDropdownRef}>
                                <label htmlFor="subcategory-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Sub Category:
                                </label>
                                <div className="mt-1 relative w-full">
                                    <button
                                        type="button"
                                        onClick={() => selectedCategory && !subCategoriesLoading && setSubOpen(!subOpen)}
                                        disabled={!selectedCategory || subCategoriesLoading}
                                        className={`relative w-full border border-gray-300 dark:border-gray-600 rounded-md pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${!selectedCategory || subCategoriesLoading
                                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white cursor-pointer'
                                            }`}
                                    >
                                        <span className="block truncate">
                                            {selectedSubCategory ? selectedSubCategory.name :
                                                !selectedCategory ? 'Please select a category first' :
                                                    subCategoriesLoading ? 'Chargement des sous-catégories...' :
                                                        subCategoriesError ? 'Erreur lors du chargement' :
                                                            'Select sub category'}
                                        </span>
                                        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                            <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                                                fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd"
                                                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                                                    clipRule="evenodd" />
                                            </svg>
                                        </span>
                                    </button>

                                    {subOpen && selectedCategory && (
                                        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 dark:ring-gray-600 overflow-auto focus:outline-none sm:text-sm">
                                            {subCategoriesLoading ? (
                                                <div className="py-2 pl-3 pr-9 text-gray-500 dark:text-gray-400">
                                                    Chargement des sous-catégories...
                                                </div>
                                            ) : subCategoriesError ? (
                                                <div className="py-2 pl-3 pr-9 text-red-500 dark:text-red-400">
                                                    Erreur: {subCategoriesError}
                                                </div>
                                            ) : availableSubCategories?.subCategories?.length === 0 ? (
                                                <div className="py-2 pl-3 pr-9 text-gray-500 dark:text-gray-400">
                                                    Aucune sous-catégorie disponible
                                                </div>
                                            ) : (
                                                availableSubCategories?.subCategories?.map((subCat) => (
                                                    <div key={subCat.id} onClick={() => {
                                                        setSelectedSubCategory({ 
                                                            id: subCat.id, 
                                                            name: subCat.name, 
                                                            categoryId: subCat.category?.id || selectedCategory?.id || 0
                                                        });
                                                        setSubOpen(false);
                                                    }}
                                                        className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-600 hover:text-white text-gray-900 dark:text-white dark:hover:bg-indigo-500">
                                                        <span className={`block truncate ${selectedSubCategory?.id === subCat.id ? 'font-semibold' : ''}`}>
                                                            {subCat.name}
                                                        </span>
                                                        {selectedSubCategory?.id === subCat.id && (
                                                            <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600 dark:text-indigo-400 hover:text-white">
                                                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                                                                    fill="currentColor">
                                                                    <path fillRule="evenodd"
                                                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                        clipRule="evenodd" />
                                                                </svg>
                                                            </span>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-gray-200 dark:border-gray-600 my-6"></div>

                            {/* champ de sélection de l'application web */}
                            <div className="relative w-full" ref={webAppDropdownRef}>
                                <label htmlFor="webapp-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Web Application:</label>
                                {plateformsError && (
                                    <div className="mb-2 text-sm text-red-600 dark:text-red-400">
                                        <span className="flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                            Erreur lors du chargement des plateformes: {plateformsError}
                                        </span>
                                    </div>
                                )}
                                <div className="mt-1 relative w-full">
                                    <button
                                        type="button"
                                        onClick={() => !plateformsLoading && setWebAppOpen(!webAppOpen)}
                                        disabled={plateformsLoading}
                                        className={`relative w-full border border-gray-300 dark:border-gray-600 rounded-md pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm ${plateformsLoading
                                                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                                            }`}>
                                        <span className="block truncate">
                                            {plateformsLoading
                                                ? 'Chargement des plateformes...'
                                                : plateformsError
                                                    ? 'Erreur lors du chargement'
                                                    : selectedWebApp
                                                        ? selectedWebApp.name
                                                        : 'Select web application'
                                            }
                                        </span>
                                        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                            <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                                                fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd"
                                                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                                                    clipRule="evenodd" />
                                            </svg>
                                        </span>
                                    </button>

                                    {webAppOpen && (
                                        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 dark:ring-gray-600 overflow-auto focus:outline-none sm:text-sm">
                                            {plateformsLoading ? (
                                                <div className="py-2 pl-3 pr-9 text-gray-500 dark:text-gray-400">
                                                    Chargement des plateformes...
                                                </div>
                                            ) : plateformsError ? (
                                                <div className="py-2 pl-3 pr-9 text-red-500 dark:text-red-400">
                                                    Erreur: {plateformsError}
                                                </div>
                                            ) : plateformsData?.length === 0 ? (
                                                <div className="py-2 pl-3 pr-9 text-gray-500 dark:text-gray-400">
                                                    Aucune plateforme disponible
                                                </div>
                                            ) : (
                                                plateformsData?.map((platform) => (
                                                    <div key={platform.id} onClick={() => {
                                                        setSelectedWebApp({ id: platform.id, name: platform.name });
                                                        setWebAppOpen(false);
                                                    }}
                                                        className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-600 hover:text-white text-gray-900 dark:text-white dark:hover:bg-indigo-500">
                                                        <span className={`block truncate ${selectedWebApp?.id === platform.id ? 'font-semibold' : ''}`}>
                                                            {platform.name}
                                                        </span>
                                                        {selectedWebApp?.id === platform.id && (
                                                            <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600 dark:text-indigo-400 hover:text-white">
                                                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                                                                    fill="currentColor">
                                                                    <path fillRule="evenodd"
                                                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                        clipRule="evenodd" />
                                                                </svg>
                                                            </span>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>                            {/* Divider */}
                            <div className="border-t border-gray-200 dark:border-gray-600 my-6"></div>

                            {/* champ de titre avec onglets de langues */}
                            <div className="relative w-full">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Title:</label>

                                {/* Onglets des langues */}
                                <div className="flex flex-wrap items-center gap-2 mb-4">
                                    {languages.map((language) => (
                                        <button
                                            key={language.id}
                                            type="button"
                                            onClick={() => setSelectedLanguage(language)}
                                            className={`px-4 py-2 text-sm font-medium cursor-pointer transition-colors border-b-2 ${selectedLanguage.id === language.id
                                                ? 'bg-transparent border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                                                : 'bg-gray-100 dark:bg-gray-700 border-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white'
                                                }`}
                                        >
                                            {language.name}
                                        </button>
                                    ))}

                                    {/* Bouton Add Language */}
                                    <button
                                        type="button"
                                        onClick={() => setShowAddLanguageModal(true)}
                                        className="px-3 py-2 text-sm font-medium bg-transparent text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border border-dashed border-gray-400 dark:border-gray-500 hover:border-gray-500 dark:hover:border-gray-400 rounded-md transition-colors duration-200 flex items-center space-x-1"
                                        title="Add new language"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        <span>Add Language</span>
                                    </button>
                                </div>
                                <div className="space-y-4 w-full">
                                    {/* Champ titre */}
                                    <div className="w-full">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Title ({selectedLanguage.name})
                                        </label>
                                        <input
                                            type="text"
                                            value={titles[selectedLanguage.id] || ''}
                                            onChange={(e) => handleTitleChange(selectedLanguage.id, e.target.value)}
                                            placeholder={`Enter title in ${selectedLanguage.name}`}
                                            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                                        />
                                    </div>

                                    {/* Champ description */}
                                    <div className="w-full">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Description ({selectedLanguage.name})
                                        </label>
                                        <textarea
                                            value={descriptions[selectedLanguage.id] || ''}
                                            onChange={(e) => handleDescriptionChange(selectedLanguage.id, e.target.value)}
                                            placeholder={`Enter description in ${selectedLanguage.name}`}
                                            rows={4}
                                            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 resize-vertical"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-gray-200 dark:border-gray-600 my-6"></div>

                            {/* champ image multiple */}
                            <div className="relative w-full">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Image:</label>

                                {/* Liste des champs d'upload d'images en grille */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                                    {imageFields.map((field) => (
                                        <div key={field.id} className="space-y-2 w-full">
                                            {/* Zone d'upload avec style pointillé */}
                                            <div className="relative w-full">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file && file.type.startsWith('image/')) {
                                                            handleImageChange(field.id, file);
                                                        }
                                                        // Réinitialiser l'input pour permettre la sélection du même fichier
                                                        e.target.value = '';
                                                    }}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                    id={`image-upload-${field.id}`}
                                                />
                                                <label
                                                    htmlFor={`image-upload-${field.id}`}
                                                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md p-4 flex flex-col items-center justify-center hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 cursor-pointer h-[250px] w-full"
                                                >
                                                    {field.file ? (
                                                        /* Image sélectionnée */
                                                        <div className="w-full h-full">
                                                            <img
                                                                src={URL.createObjectURL(field.file)}
                                                                alt="Selected"
                                                                className="w-full h-full object-cover rounded-md"
                                                            />
                                                        </div>
                                                    ) : (
                                                        /* Zone vide pour upload */
                                                        <div className="text-center h-full flex flex-col justify-center">
                                                            <svg className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                            <div className="text-gray-600 dark:text-gray-400">
                                                                <p className="text-sm font-medium">Click to upload an image</p>
                                                                <p className="text-xs">PNG, JPG, GIF, WebP, etc.</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </label>
                                            </div>

                                            {/* Bouton supprimer placé en bas du champ */}
                                            {imageFields.length > 1 && (
                                                <div className="flex justify-start w-full">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImageField(field.id)}
                                                        className="flex items-center justify-center w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                                        title="Remove image"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Bouton pour ajouter un nouveau champ */}
                                <div className="mt-4 w-full">
                                    <button
                                        type="button"
                                        onClick={addImageField}
                                        className="flex items-center justify-center sm:justify-start cursor-pointer space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 w-full sm:w-auto"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        <span>New image field</span>
                                    </button>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-gray-200 dark:border-gray-600 my-6"></div>

                            {/* champ video multiple */}
                            <div className="relative w-full">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Video:</label>

                                {/* Liste des champs d'upload de vidéos en grille */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                                    {videoFields.map((field) => (
                                        <div key={`video-${field.id}`} className="space-y-2 w-full">
                                            {/* Zone d'upload avec style pointillé */}
                                            <div className="relative w-full">
                                                <input
                                                    type="file"
                                                    accept="video/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file && file.type.startsWith('video/')) {
                                                            handleVideoChange(field.id, file);
                                                        }
                                                        // Réinitialiser l'input pour permettre la sélection du même fichier
                                                        e.target.value = '';
                                                    }}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                    id={`video-upload-${field.id}`}
                                                />
                                                <label
                                                    htmlFor={`video-upload-${field.id}`}
                                                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md p-4 flex flex-col items-center justify-center hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 cursor-pointer h-[250px] w-full"
                                                >
                                                    {field.file ? (
                                                        /* Vidéo sélectionnée */
                                                        <div className="w-full h-full">
                                                            <video
                                                                src={URL.createObjectURL(field.file)}
                                                                controls
                                                                className="w-full h-full object-cover rounded-md"
                                                            />
                                                        </div>
                                                    ) : (
                                                        /* Zone vide pour upload */
                                                        <div className="text-center h-full flex flex-col justify-center">
                                                            <svg className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                            </svg>
                                                            <div className="text-gray-600 dark:text-gray-400">
                                                                <p className="text-sm font-medium">Click to upload a video</p>
                                                                <p className="text-xs">MP4, AVI, MOV up to 2GB</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </label>
                                            </div>

                                            {/* Bouton supprimer placé en bas du champ */}
                                            {videoFields.length > 1 && (
                                                <div className="flex justify-start w-full">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeVideoField(field.id)}
                                                        className="flex items-center justify-center w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                                        title="Remove video"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Bouton pour ajouter un nouveau champ vidéo */}
                                <div className="mt-4 w-full">
                                    <button
                                        type="button"
                                        onClick={addVideoField}
                                        className="flex items-center justify-center sm:justify-start cursor-pointer space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 w-full sm:w-auto"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        <span>New video field</span>
                                    </button>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-gray-200 dark:border-gray-600 my-6"></div>

                            {/* boutons upload et reset */}
                            <div className="flex justify-center sm:justify-end w-full gap-3">
                                {/* Bouton Reset Form */}
                                <button
                                    type="button"
                                    onClick={handleResetForm}
                                    disabled={isSubmitting}
                                    className={`flex items-center justify-center px-4 py-2 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 w-full sm:w-auto ${isSubmitting
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-gray-500 hover:bg-gray-600 text-white cursor-pointer'
                                        }`}
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    <span>Reset Form</span>
                                </button>

                                {/* Bouton Upload */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`flex items-center justify-center px-4 py-2 text-white rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full sm:w-auto ${isSubmitting
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                                        }`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Uploading...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span>Upload</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form >
                    </div >
                </div >
            </div>

            {/* Modal Add Language */}
            {showAddLanguageModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                            Add New Language
                        </h3>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Language Name
                            </label>
                            <input
                                type="text"
                                value={newLanguageName}
                                onChange={(e) => setNewLanguageName(e.target.value)}
                                placeholder="Enter language name"
                                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md px-3 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleAddLanguage();
                                    }
                                }}
                                autoFocus
                            />
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={handleCancelAddLanguage}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleAddLanguage}
                                disabled={!newLanguageName.trim()}
                                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-md transition-colors duration-200"
                            >
                                Add Language
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};
export default UploadPost;