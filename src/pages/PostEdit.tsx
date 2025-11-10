import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UsePost } from "../hooks/usePost";
import { Languages } from "lucide-react";
import useCategoryPost from "../hooks/posts/useCategoryPost";
import useSubCategoryPost from "../hooks/posts/useSubCategoryPost";

// data static for category
// const categories = [
//     { id: 1, name: "Category 1" },
//     { id: 2, name: "Category 2" },
//     { id: 3, name: "Category 3" },
// ];

// data static for sub category
// const subCategories = [
//     { id: 1, name: "Sub Category 1", categoryId: 1 },
//     { id: 2, name: "Sub Category 2", categoryId: 1 },
//     { id: 3, name: "Sub Category 3", categoryId: 1 },
//     { id: 4, name: "Sub Category 4", categoryId: 2 },
//     { id: 5, name: "Sub Category 5", categoryId: 2 },
//     { id: 6, name: "Sub Category 6", categoryId: 3 },
//     { id: 7, name: "Sub Category 7", categoryId: 3 },
//     { id: 8, name: "Sub Category 8", categoryId: 3 },
// ];

const languages = [
    { id: 1, code: "zh", name: "中文" },
    { id: 2, code: "en", name: "English" },
    { id: 3, code: "fr", name: "Français" },
    { id: 4, code: "ar", name: "العربية" },
    { id: 5, code: "mg", name: "Malagasy" },
];

const PostEdit = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: post, loading, error } = UsePost(id);
    const [open, setOpen] = useState(false);
    const [subOpen, setSubOpen] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<{ id: number, name: string } | null>();
    const [selectedSubCategory, setSelectedSubCategory] = useState<{ id: number, name: string, categoryId: number } | null>(null);
    const [selectedLanguage, setSelectedLanguage] = useState<string>("en");
    const [titles, setTitles] = useState<{ [key: number]: string }>({});
    const [descriptions, setDescriptions] = useState<{ [key: number]: string }>({});
    const [imageFields, setImageFields] = useState<{ id: number, file: File | null, url?: string }[]>([{ id: 1, file: null }]);
    const [videoFields, setVideoFields] = useState<{ id: number, file: File | null, url?: string }[]>([{ id: 1, file: null }]);

    const { data: categoriesResponse, loading: categoriesLoading, error: categoriesError } = useCategoryPost();
    const { data: subCategoriesResponse, loading: subCategoriesLoading, error: subCategoriesError } = useSubCategoryPost(selectedCategory?.id);
    
    const categoryDropdownRef = useRef<HTMLDivElement>(null);
    const subCategoryDropdownRef = useRef<HTMLDivElement>(null);

    const availableSubCategories = subCategoriesResponse?.subCategories;
    console.log("availableSubCategories", availableSubCategories);
    
    console.log("post", post);
    // Pré-remplir les champs avec les données du post
    useEffect(() => {
        if (post) {
            const matchingCategory = categoriesResponse?.categories.find(cat => cat.id === post.category.id);
            // const matchingSubCategory = subCategoriesResponse?.subCategories.find(subCat => subCat.id === post.subCategory_id);
            if (matchingCategory) {
                setSelectedCategory(matchingCategory);
                // setSelectedSubCategory(matchingSubCategory);
                setSelectedOptions([matchingCategory.name]);
            }
            
            if (post.title && post.title.length > 0) {
                const titlesMap: { [key: number]: string } = {};
                const descriptionsMap: { [key: number]: string } = {};
                
                post.title.forEach((item) => {
                    const language = languages.find(lang => lang.code === item.language);
                    if (language) {
                        titlesMap[language.id] = item.title;
                        descriptionsMap[language.id] = item.description;
                    }
                });
                
                setTitles(titlesMap);
                setDescriptions(descriptionsMap);
            }

            if (post.images && post.images.length > 0) {
                setImageFields(post.images.map((url, index) => ({
                    id: index + 1,
                    file: null,
                    url: url
                })));
            }

            if (post.videos && post.videos.length > 0) {
                setVideoFields(post.videos.map((url, index) => ({
                    id: index + 1,
                    file: null,
                    url: url
                })));
            }
        }
    }, [post]);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
            if (subCategoryDropdownRef.current && !subCategoryDropdownRef.current.contains(event.target as Node)) {
                setSubOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleTitleChange = (languageId: number, value: string) => {
        setTitles(prev => ({ ...prev, [languageId]: value }));
    };

    const handleDescriptionChange = (languageId: number, value: string) => {
        setDescriptions(prev => ({ ...prev, [languageId]: value }));
    };

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
        if (file) {
            setImageFields(prev => prev.map(field => 
                field.id === id ? { ...field, file, url: undefined } : field
            ));
        }
    };

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
        if (file) {
            const maxSize = 2 * 1024 * 1024 * 1024;
            if (file.size > maxSize) {
                alert(`⚠️ La vidéo est trop volumineuse !\n\nTaille: ${(file.size / 1024 / 1024 / 1024).toFixed(2)} GB\nMax: 2 GB`);
                return;
            }
            
            setVideoFields(prev => prev.map(field => 
                field.id === id ? { ...field, file, url: undefined } : field
            ));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = {
            id: post?.id,
            ref: post?.ref,
            category: selectedCategory,
            subCategory: selectedSubCategory,
            titles: Object.entries(titles).map(([langId, title]) => {
                const lang = languages.find(l => l.id === parseInt(langId));
                return {
                    language: lang?.code,
                    title: title,
                    description: descriptions[parseInt(langId)] || ''
                };
            }),
            images: imageFields.filter(field => field.file !== null || field.url).map(field => ({
                id: field.id,
                fileName: field.file?.name || field.url,
                isNew: !!field.file
            })),
            videos: videoFields.filter(field => field.file !== null || field.url).map(field => ({
                id: field.id,
                fileName: field.file?.name || field.url,
                isNew: !!field.file
            }))
        };

        console.log('📊 Données de mise à jour:', formData);
        alert(`✅ Post ${post?.ref} mis à jour!\n\nVoir la console pour les détails.`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">loading...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 dark:text-red-400 mb-4">Erreur: {error.message}</p>
                    <button
                        onClick={() => navigate('/post')}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                        Retour
                    </button>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Post not Found</p>
                    <button
                        onClick={() => navigate('/post')}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                        back to list Post
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-start pb-6">
            <div className="flex w-full border border-gray-300 dark:border-gray-700 rounded-lg p-4 sm:p-6">
                <div className="w-full">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                            Modify: {post.ref}
                        </h2>
                        <button
                            onClick={() => navigate(`/post/${id}`)}
                            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    
                    <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
                        {/* Catégorie */}
                        <div className="relative w-full" ref={categoryDropdownRef}>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Catégorie:
                            </label>
                            <button 
                                type="button" 
                                onClick={() => setOpen(!open)}
                                className="relative w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md pl-3 pr-10 py-2 text-left focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm text-gray-900 dark:text-white"
                            >
                                <span className="block truncate">
                                    {selectedOptions.length ? selectedOptions[0] : post.category.name }
                                </span>
                                <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                                    </svg>
                                </span>
                            </button>

                            {open && (
                                <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 max-h-60 rounded-md py-1 shadow-lg ring-1 ring-black ring-opacity-5 overflow-auto">
                                    {categoriesResponse?.categories.map((cat) => (
                                        <div 
                                            key={cat.id} 
                                            onClick={() => {
                                                setSelectedOptions([cat.name]);
                                                setSelectedCategory({ id: cat.id, name: cat.name });
                                                setSelectedSubCategory(null);
                                                setOpen(false);
                                            }}
                                            className="cursor-pointer py-2 pl-3 pr-9 hover:bg-indigo-600 hover:text-white text-gray-900 dark:text-white"
                                        >
                                            {cat.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Sous-catégorie */}
                        <div className="relative w-full" ref={subCategoryDropdownRef}>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Sous-catégorie:
                            </label>
                            <button
                                type="button"
                                onClick={() => selectedCategory && setSubOpen(!subOpen)}
                                disabled={!selectedCategory}
                                className={`relative w-full border rounded-md pl-3 pr-10 py-2 text-left focus:outline-none text-sm ${
                                    !selectedCategory
                                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                                }`}
                            >
                                <span className="block truncate">
                                    {/* {selectedSubCategory ? selectedSubCategory.name : post.category.subCategory.name */}
                                    {selectedSubCategory ? selectedSubCategory.name : 'Sélectionner'}
                                </span>
                            </button>

                            {subOpen && selectedCategory && availableSubCategories.length > 0 && (
                                <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 max-h-60 rounded-md py-1 shadow-lg overflow-auto">
                                    {availableSubCategories.map((subCat) => (
                                        <div 
                                            key={subCat.id} 
                                            onClick={() => {
                                                setSelectedSubCategory({ id: subCat.id, name: subCat.name, categoryId: subCat.category.id });
                                                setSubOpen(false);
                                            }}
                                            className="cursor-pointer py-2 pl-3 hover:bg-indigo-600 hover:text-white text-gray-900 dark:text-white"
                                        >
                                            {subCat.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Titres et descriptions */}
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Titres et descriptions par langue:
                            </label>
                            
                            {/* Sélecteur de langue */}
                            {post.title.length > 0 && (
                                <div className="flex items-center gap-4 mb-4">
                                    <Languages size={20} className="text-gray-700 dark:text-gray-300" />
                                    <div className="flex gap-2 flex-wrap">
                                        {post.title.map((item) => (
                                            <button
                                                key={item.language}
                                                type="button"
                                                onClick={() => setSelectedLanguage(item.language)}
                                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                                    selectedLanguage === item.language
                                                        ? 'bg-blue-500 text-white shadow-md'
                                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                                }`}
                                            >
                                                {item.language.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Champs d'édition pour chaque langue */}
                            {languages.map((lang) => (
                                <div 
                                    key={lang.id} 
                                    className={`space-y-3 p-4 rounded-lg border-2 border-gray-800 transition-all ${
                                        selectedLanguage === lang.code
                                            ? 'border-blue-500'
                                            : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800'
                                    }`}
                                    style={{ display: selectedLanguage === lang.code ? 'block' : 'none' }}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {lang.name}
                                        </span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            ({lang.code.toUpperCase()})
                                        </span>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Titre:
                                        </label>
                                        <input
                                            type="text"
                                            value={titles[lang.id] || ''}
                                            onChange={(e) => handleTitleChange(lang.id, e.target.value)}
                                            placeholder={`Titre en ${lang.name}`}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Description:
                                        </label>
                                        <textarea
                                            value={descriptions[lang.id] || ''}
                                            onChange={(e) => handleDescriptionChange(lang.id, e.target.value)}
                                            placeholder={`Description en ${lang.name}`}
                                            rows={4}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>


                        
                        {/* Images */}
                        <div className="relative w-full">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Images:</label>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {imageFields.map((field) => (
                                    <div key={field.id} className="space-y-2">
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleImageChange(field.id, file);
                                                    e.target.value = '';
                                                }}
                                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                id={`img-${field.id}`}
                                            />
                                            <label
                                                htmlFor={`img-${field.id}`}
                                                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md p-4 flex items-center justify-center hover:border-blue-500 cursor-pointer h-[250px]"
                                            >
                                                {field.file ? (
                                                    <img src={URL.createObjectURL(field.file)} alt="New" className="w-full h-full object-cover rounded" />
                                                ) : field.url ? (
                                                    <img src={field.url} alt="Existing" className="w-full h-full object-cover rounded" />
                                                ) : (
                                                    <div className="text-center">
                                                        <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                                                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" />
                                                        </svg>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">Cliquer pour uploader</p>
                                                    </div>
                                                )}
                                            </label>
                                        </div>
                                        
                                        {imageFields.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeImageField(field.id)}
                                                className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-md"
                                            >
                                                <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={addImageField}
                                className="mt-4 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200"
                            >
                                + Ajouter une image
                            </button>
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-600 my-6"></div>

                        {/* Vidéos */}
                        <div className="relative w-full">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Vidéos:</label>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {videoFields.map((field) => (
                                    <div key={field.id} className="space-y-2">
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept="video/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleVideoChange(field.id, file);
                                                    e.target.value = '';
                                                }}
                                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                id={`vid-${field.id}`}
                                            />
                                            <label
                                                htmlFor={`vid-${field.id}`}
                                                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md p-4 flex items-center justify-center hover:border-blue-500 cursor-pointer h-[250px]"
                                            >
                                                {field.file ? (
                                                    <video src={URL.createObjectURL(field.file)} controls className="w-full h-full object-cover rounded" />
                                                ) : field.url ? (
                                                    <video src={field.url} controls className="w-full h-full object-cover rounded" />
                                                ) : (
                                                    <div className="text-center">
                                                        <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                        </svg>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">Cliquer pour uploader</p>
                                                        <p className="text-xs text-gray-500">Max 2GB</p>
                                                    </div>
                                                )}
                                            </label>
                                        </div>
                                        
                                        {videoFields.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeVideoField(field.id)}
                                                className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-md"
                                            >
                                                <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={addVideoField}
                                className="mt-4 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200"
                            >
                                + Add video
                            </button>
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-600 my-6"></div>

                        {/* Boutons d'action */}
                        <div className="flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => navigate(`/post/${id}`)}
                                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Update
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PostEdit;