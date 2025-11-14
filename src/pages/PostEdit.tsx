import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UsePost } from "../hooks/usePost";
import useCategoryPost from "../hooks/posts/useCategoryPost";
import useSubCategoryPost from "../hooks/posts/useSubCategoryPost";
import toast from "react-hot-toast";
import useUpdatePost from "../hooks/useUpdatePost";
import LanguageAutoComplete from "../components/LanguageAutoComplete";

type Language = {
    code: string;
    name: string;
};


const PostEdit = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: post, loading, error } = UsePost(id);
    const [open, setOpen] = useState(false);
    const [subOpen, setSubOpen] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<{ id: number, name: string } | null>();
    const [selectedSubCategory, setSelectedSubCategory] = useState<{ id: number, name: string, categoryId: number } | null>(null);
    const [languages, setLanguages] = useState<{ id: number, name: string, code: string }[]>([]);
    const [selectedLanguage, setSelectedLanguage] = useState<{ id: number, name: string, code: string } | null>(null);
    const [titles, setTitles] = useState<{ [key: number]: string }>({});
    const [descriptions, setDescriptions] = useState<{ [key: number]: string }>({});
    const [imageFields, setImageFields] = useState<{ id: number, file: File | null, url?: string }[]>([{ id: 1, file: null }]);
    const [videoFields, setVideoFields] = useState<{ id: number, file: File | null, url?: string }[]>([{ id: 1, file: null }]);
    const [showAddLanguageModal, setShowAddLanguageModal] = useState(false);
    const [selectedLanguageFromBackend, setSelectedLanguageFromBackend] = useState<Language | null>(null);

    const { data: categoriesResponse } = useCategoryPost();
    const { data: subCategoriesResponse } = useSubCategoryPost(selectedCategory?.id);
    
    const categoryDropdownRef = useRef<HTMLDivElement>(null);
    const subCategoryDropdownRef = useRef<HTMLDivElement>(null);

    const availableSubCategories = subCategoriesResponse?.subCategories;
    console.log("availableSubCategories", availableSubCategories);
    
    console.log("post", post);
    // Pré-remplir les champs avec les données du post
    useEffect(() => {
        if (post) {
            const matchingCategory = categoriesResponse?.categories.find(cat => cat.id === post.postCategory.id);
            // const matchingSubCategory = subCategoriesResponse?.subCategories.find(subCat => subCat.id === post.sub_category_id);
            if (matchingCategory) {
                setSelectedCategory(matchingCategory);
                // setSelectedSubCategory(matchingSubCategory);
                setSelectedOptions([matchingCategory.name]);
            }
            
            if (post.titles && post.titles.length > 0) {
                const titlesMap: { [key: number]: string } = {};
                const descriptionsMap: { [key: number]: string } = {};
                const postLanguages: { id: number, name: string, code: string }[] = [];
                
                post.titles.forEach((item, index) => {
                    const languageId = index + 1;
                    // Créer l'objet langue basé sur les données du post
                    const postLanguage = {
                        id: languageId,
                        name: item.language?.name || item.i18_language.toUpperCase(),
                        code: item.i18_language
                    };
                    
                    postLanguages.push(postLanguage);
                    titlesMap[languageId] = item.title;
                    descriptionsMap[languageId] = item.description || '';
                });
                
                setLanguages(postLanguages);
                setTitles(titlesMap);
                setDescriptions(descriptionsMap);
                
                // Sélectionner la première langue par défaut
                if (postLanguages.length > 0) {
                    setSelectedLanguage(postLanguages[0]);
                }
            }

            if (post.images && post.images.length > 0) {
                setImageFields(post.images.map((image, index) => ({
                    id: index + 1,
                    file: null,
                    url: image.public_urls.local_image_url || ''
                })));
            }

            if (post.videos && post.videos.length > 0) {
                setVideoFields(post.videos.map((video, index) => ({
                    id: index + 1,
                    file: null,
                    url: video.public_urls.local_mp4_url || ''
                })));
            }
        }
    }, [post, categoriesResponse]);

    // Effet pour s'assurer que selectedLanguage est toujours valide
    useEffect(() => {
        if (languages.length > 0 && (!selectedLanguage || !languages.find(lang => lang.id === selectedLanguage.id))) {
            setSelectedLanguage(languages[0]);
        }
    }, [languages, selectedLanguage]);
    
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

    // Fonction pour ajouter une nouvelle langue
    const handleAddLanguage = () => {
        if (selectedLanguageFromBackend) {
            // Vérifier si la langue n'existe pas déjà
            const existingLanguage = languages.find(lang => lang.code === selectedLanguageFromBackend.code);
            if (existingLanguage) {
                toast.error("This language is already added!");
                return;
            }

            const newId = Math.max(0, ...languages.map(lang => lang.id)) + 1;
            const newLanguage = { 
                id: newId, 
                name: selectedLanguageFromBackend.name,
                code: selectedLanguageFromBackend.code
            };
            setLanguages(prev => [...prev, newLanguage]);
            setSelectedLanguageFromBackend(null);
            setShowAddLanguageModal(false);
            setSelectedLanguage(newLanguage); // Sélectionner automatiquement la nouvelle langue
        }
    };

    // Fonction pour annuler l'ajout de langue
    const handleCancelAddLanguage = () => {
        setSelectedLanguageFromBackend(null);
        setShowAddLanguageModal(false);
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

    const { updatePost, loading: updating } = useUpdatePost();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            id: post?.id,
            category_id: selectedCategory?.id ?? post?.postCategory?.id,
            sub_category_id: selectedSubCategory?.id ?? post?.postSubCategory?.id,
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

        // If there are newly added files (file objects), send a FormData so the files are transmitted.
        const hasNewFiles = imageFields.some(f => f.file) || videoFields.some(f => f.file);

        try {
            let res;
            if (hasNewFiles) {
                const fd = new FormData();
                // Keep the same metadata structure by sending it as JSON in a field
                fd.append('payload', JSON.stringify(payload));

                // Append new image files (backend expects multiple 'images' fields similar to upload)
                imageFields.filter(f => f.file).forEach((f) => {
                    if (f.file) fd.append('images', f.file, f.file.name);
                });

                // Append new video files
                videoFields.filter(f => f.file).forEach((f) => {
                    if (f.file) fd.append('videos', f.file, f.file.name);
                });

                res = await updatePost(post?.id, fd);
            } else {
                // No files to upload — send JSON payload as before
                res = await updatePost(post?.id, payload);
            }

            toast.success("Post updated successfully");
            // navigate to post details or refresh
            navigate(`/post/${id}`);
            console.log('Update response:', payload);
        } catch (err) {
            console.error(err);
            toast.error("Failed to update post. See console for details.");
        }
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
                            Modify: POST-{String(post.id).padStart(3, '0')}
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
                                Category:
                            </label>
                            <button 
                                type="button" 
                                onClick={() => setOpen(!open)}
                                className="relative w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md pl-3 pr-10 py-2 text-left focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm text-gray-900 dark:text-white"
                            >
                                <span className="block truncate">
                                    {selectedOptions.length ? selectedOptions[0] : post.postCategory.name }
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
                                Sub-Category:
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
                                    
                                    {selectedSubCategory ? selectedSubCategory.name : post.postSubCategory.name}
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

                        {/* Titres et descriptions avec système de langues dynamique */}
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Title and description by language:
                            </label>

                            {/* Onglets des langues */}
                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                {languages.length > 0 && languages.map((language) => (
                                    <button
                                        key={language.id}
                                        type="button"
                                        onClick={() => setSelectedLanguage(language)}
                                        className={`px-4 py-2 text-sm font-medium cursor-pointer transition-colors border-b-2 ${selectedLanguage?.id === language.id
                                            ? 'bg-transparent border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                                            : 'bg-gray-100 dark:bg-gray-700 border-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white'
                                            }`}
                                    >
                                        {language.name}
                                    </button>
                                ))}

                                {/* Bouton Add Title */}
                                <button
                                    type="button"
                                    onClick={() => setShowAddLanguageModal(true)}
                                    className="px-3 py-2 text-sm font-medium bg-transparent text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border border-dashed border-gray-400 dark:border-gray-500 hover:border-gray-500 dark:hover:border-gray-400 rounded-md transition-colors duration-200 flex items-center space-x-1"
                                    title="Add new title"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    <span>Add Title</span>
                                </button>
                            </div>

                            <div className="space-y-4 w-full">
                                {languages.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        <p className="text-sm">No titles created yet. Click "Add Title" to create your first title.</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Champ titre */}
                                        {selectedLanguage && (
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
                                        )}

                                        {/* Champ description */}
                                        {selectedLanguage && (
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
                                        )}
                                    </>
                                )}
                            </div>
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
                                disabled={updating}
                                className={`px-6 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2 ${updating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                {updating ? 'Updating...' : 'Update'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Modal Add Language */}
            {showAddLanguageModal && (
                <div className="fixed inset-0 bg-black/60 bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                            New Title
                        </h3>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Select Language
                            </label>
                            <div className="">
                                <LanguageAutoComplete 
                                    onSelect={(lang) => setSelectedLanguageFromBackend(lang)}
                                    defaultValue={selectedLanguageFromBackend || undefined}
                                />
                            </div>
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
                                disabled={!selectedLanguageFromBackend}
                                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-md transition-colors duration-200"
                            >
                                Add Title
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostEdit;