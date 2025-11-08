import { useState, useRef, useEffect } from "react";

// data static for category
const categories = [
    { id: 1, name: "Category 1" },
    { id: 2, name: "Category 2" },
    { id: 3, name: "Category 3" },
];

// data static for sub category
const subCategories = [
    { id: 1, name: "Sub Category 1", categoryId: 1 },
    { id: 2, name: "Sub Category 2", categoryId: 1 },
    { id: 3, name: "Sub Category 3", categoryId: 1 },
    { id: 4, name: "Sub Category 4", categoryId: 2 },
    { id: 5, name: "Sub Category 5", categoryId: 2 },
    { id: 6, name: "Sub Category 6", categoryId: 3 },
    { id: 7, name: "Sub Category 7", categoryId: 3 },
    { id: 8, name: "Sub Category 8", categoryId: 3 },
];

const languages = [
    { id: 1, name: "中文" },
    { id: 2, name: "English" },
]

const UploadPost = () => {
    const [open, setOpen] = useState(false);
    const [subOpen, setSubOpen] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<{ id: number, name: string } | null>(null);
    const [selectedSubCategory, setSelectedSubCategory] = useState<{ id: number, name: string, categoryId: number } | null>(null);
    const [selectedLanguage, setSelectedLanguage] = useState<{ id: number, name: string }>(languages[0]); // Default to first language
    const [titles, setTitles] = useState<{ [key: number]: string }>({});
    const [descriptions, setDescriptions] = useState<{ [key: number]: string }>({});
    const [imageFields, setImageFields] = useState<{ id: number, file: File | null }[]>([{ id: 1, file: null }]);
    const [videoFields, setVideoFields] = useState<{ id: number, file: File | null }[]>([{ id: 1, file: null }]);

    // Refs pour détecter les clics à l'extérieur
    const categoryDropdownRef = useRef<HTMLDivElement>(null);
    const subCategoryDropdownRef = useRef<HTMLDivElement>(null);

    // Filtrer les sous-catégories selon la catégorie sélectionnée
    const availableSubCategories = selectedCategory ? subCategories.filter(sub => sub.categoryId === selectedCategory.id) : [];

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
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Fonctions pour gérer les titres et descriptions par langue
    const handleTitleChange = (languageId: number, value: string) => {
        setTitles(prev => ({ ...prev, [languageId]: value }));
    };

    const handleDescriptionChange = (languageId: number, value: string) => {
        setDescriptions(prev => ({ ...prev, [languageId]: value }));
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
                alert(`⚠️ La vidéo est trop volumineuse !\n\nTaille du fichier: ${(file.size / 1024 / 1024 / 1024).toFixed(2)} GB\nTaille maximum autorisée: 2 GB\n\nVeuillez choisir une vidéo plus petite.`);
                return;
            }
            
            setVideoFields(prev => prev.map(field => 
                field.id === id ? { ...field, file } : field
            ));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Récupérer les données du formulaire
        const formData = {
            category: selectedCategory,
            subCategory: selectedSubCategory,
            titles: titles,
            descriptions: descriptions,
            images: imageFields.filter(field => field.file !== null).map(field => ({
                id: field.id,
                fileName: field.file?.name,
                fileSize: field.file?.size,
                fileType: field.file?.type
            })),
            videos: videoFields.filter(field => field.file !== null).map(field => ({
                id: field.id,
                fileName: field.file?.name,
                fileSize: field.file?.size,
                fileType: field.file?.type
            }))
        };

        // Afficher toutes les données dans une alerte
        const alertMessage = `
🔍 DONNÉES DU FORMULAIRE:

📂 CATÉGORIE:
${selectedCategory ? `• Nom: ${selectedCategory.name}\n• ID: ${selectedCategory.id}` : '• Aucune catégorie sélectionnée'}

📂 SOUS-CATÉGORIE:
${selectedSubCategory ? `• Nom: ${selectedSubCategory.name}\n• ID: ${selectedSubCategory.id}\n• Catégorie parent: ${selectedSubCategory.categoryId}` : '• Aucune sous-catégorie sélectionnée'}

📝 TITRES:
${Object.keys(titles).length > 0 ? 
    Object.entries(titles).map(([langId, title]) => {
        const lang = languages.find(l => l.id === parseInt(langId));
        return `• ${lang?.name}: "${title}"`;
    }).join('\n') : 
    '• Aucun titre saisi'
}

📄 DESCRIPTIONS:
${Object.keys(descriptions).length > 0 ? 
    Object.entries(descriptions).map(([langId, desc]) => {
        const lang = languages.find(l => l.id === parseInt(langId));
        return `• ${lang?.name}: "${desc.substring(0, 50)}${desc.length > 50 ? '...' : ''}"`;
    }).join('\n') : 
    '• Aucune description saisie'
}

🖼️ IMAGES (${formData.images.length}):
${formData.images.length > 0 ? 
    formData.images.map(img => 
        `• ${img.fileName} (${(img.fileSize! / 1024 / 1024).toFixed(2)} MB, ${img.fileType})`
    ).join('\n') : 
    '• Aucune image sélectionnée'
}

🎥 VIDÉOS (${formData.videos.length}):
${formData.videos.length > 0 ? 
    formData.videos.map(vid => 
        `• ${vid.fileName} (${(vid.fileSize! / 1024 / 1024).toFixed(2)} MB, ${vid.fileType})`
    ).join('\n') : 
    '• Aucune vidéo sélectionnée'
}
        `;

        alert(alertMessage);
        
        // Log pour debug dans la console
        console.log('📊 Données complètes du formulaire:', formData);
    };

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
                                <div className="mt-1 relative w-full">
                                    <button type="button" onClick={() => setOpen(!open)}
                                        className="relative w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-gray-900 dark:text-white">
                                        <span className="block truncate">
                                            {selectedOptions.length ? selectedOptions[0] : 'Select category'}
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
                                            {categories.map((cat) => (
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
                                            ))}
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
                                        onClick={() => selectedCategory && setSubOpen(!subOpen)}
                                        disabled={!selectedCategory}
                                        className={`relative w-full border border-gray-300 dark:border-gray-600 rounded-md pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${!selectedCategory
                                                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white cursor-pointer'
                                            }`}
                                    >
                                        <span className="block truncate">
                                            {selectedSubCategory ? selectedSubCategory.name :
                                                !selectedCategory ? 'Please select a category first' : 'Select sub category'}
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

                                    {subOpen && selectedCategory && availableSubCategories.length > 0 && (
                                        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 dark:ring-gray-600 overflow-auto focus:outline-none sm:text-sm">
                                            {availableSubCategories.map((subCat) => (
                                                <div key={subCat.id} onClick={() => {
                                                    setSelectedSubCategory(subCat);
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
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-gray-200 dark:border-gray-600 my-6"></div>

                            {/* champ de titre avec onglets de langues */}
                            <div className="relative w-full">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Title:</label>

                                {/* Onglets des langues */}
                                <div className="flex flex-wrap space-x-1 mb-4">
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
                                </div>

                                {/* Champs titre et description pour la langue sélectionnée */}
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

                            {/* bouton upload */}
                            <div className="flex justify-center sm:justify-end w-full">
                                <button
                                    type="submit"
                                    className="flex items-center justify-center px-4 py-2 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full sm:w-auto"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Upload</span>
                                </button>
                            </div>
                        </form >
                    </div >
                </div >
            </div>
        </div >
    );
};
export default UploadPost;