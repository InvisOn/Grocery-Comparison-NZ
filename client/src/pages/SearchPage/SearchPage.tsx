import { IonCol, IonContent, IonGrid, IonHeader, IonImg, IonItem, IonLabel, IonPage, IonRow, IonSearchbar, IonSelect, IonSelectOption, IonToolbar } from '@ionic/react';
import { CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Title, Tooltip } from 'chart.js';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ProductDetailsModal } from '../../components/ProductPage/ProductDetailsModal';
import { PaginationControls } from '../../components/SearchPage/PaginationControls';
import { SearchProductCard } from '../../components/SearchPage/SearchProductCard';
import { LoadingContainer } from '../../components/SharedComponents/loadingContainer';
import { getSearch } from "../../services/InitialSetupService";
import './SearchPage.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);


type Product = {
    products: {
        id: number;
        name: string;
        brand: string;
        details: string;
        amount: number;
        image: string;
        unitID: number;
        categoryID: number;
    };
    store_products: {
        id: number;
        storeID: number;
        productID: number;
        price: number;
    };
}

const SearchPage: React.FC = () => {
    const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
    const [addedToCart, setAddedToCart] = useState<{ [key: string]: boolean }>({});

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const [query, setQuery] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [searchAttempted, setSearchAttempted] = useState<boolean>(false);

    const [selectedProduct, setSelectedProduct] = useState<Product>();
    const [showProductDetails, setShowProductDetails] = useState(false);

    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 20;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const [totalPages, setTotalPages] = useState(1);

    const [sortedAndFilteredProducts, setSortedAndFilteredProducts] = useState<Product[]>([]);
    const [sortValue, setSortValue] = useState('lowest-highest price');

    const filteredProducts = selectedCategories.length
        ? products.filter((product) =>
            selectedCategories.includes(product.products.categoryID.toString())
        )
        : products;

    const sortOptions = [
        { label: 'Alphabetical A-Z', value: 'az' },
        { label: 'Alphabetical Z-A', value: 'za' },
        { label: 'Lowest to highest price', value: 'lowest-highest price' },
        { label: 'Highest to lowest price', value: 'highest-lowest price' },
    ];

    const dropdownRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                let results: Product[] = await getSearch("", "name", "ASC");
                setProducts(results);

                const initialQuantities = products.reduce((acc: { [key: string]: number }, product: Product) => {
                    acc[product.store_products.id] = 0;
                    return acc;
                }, {});

                setQuantities(initialQuantities);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }

        };
        fetchData();
    }, []);


    const selectSortOption = (value: string) => {
        setSortValue(value);
        setIsDropdownOpen(false);
    };


    useEffect(() => {
        localStorage.setItem('addedToCart', JSON.stringify(addedToCart));
    }, [addedToCart]);


    useEffect(() => {
        localStorage.setItem('quantities', JSON.stringify(quantities));
    }, [quantities]);


    useEffect(() => {
        const total = Math.ceil(sortedAndFilteredProducts.length / itemsPerPage);
        setTotalPages(total);
        if (currentPage < 1) {
            setCurrentPage(1);
        } else if (currentPage > total) {
            setCurrentPage(total);
        }
    }, [sortedAndFilteredProducts]);


    const handleClickOutside = useCallback((e: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
            setIsDropdownOpen(false);
        }
    }, []);


    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [handleClickOutside]);


    const handleSearch = async () => {
        setSearchAttempted(true);
        if (query.length === 0) {
            let results: Product[] = await getSearch("", "name", "ASC");
            setProducts(results);
        } else if
            (query.length < 3 || query.length > 50) {
            setError(`Search query must be between 3 and 50 characters.`);
            return;
        }

        let results = await getSearch(query, "name", "ASC").then(re => re)
        setProducts(results);


        setError('');
    };


    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSearch();
        }
    };



    const handleBlur = () => {
        handleSearch();
    };


    const toggleDropdown = () => {
        setIsDropdownOpen((prev) => !prev);
    };


    const openProductDetails = (product: Product) => {
        setSelectedProduct(product);
        console.log("openProductDetails:", selectedProduct)
        setShowProductDetails(true);
    };


    const closeProductDetails = () => {
        setShowProductDetails(false);
    };


    const increaseQuantity = (productId: string) => {
        setQuantities((prevQuantities) => ({
            ...prevQuantities,
            [productId]: (prevQuantities[productId] || 0) + 1,
        }));

    };


    const decreaseQuantity = (productId: string) => {
        setQuantities((prev) => {
            const oldQuantity = prev[productId] || 0;
            const newQuantity = Math.max(oldQuantity - 1, 0);

            setAddedToCart((cartState) => ({
                ...cartState,
                [productId]: newQuantity > 0,
            }));

            return {
                ...prev,
                [productId]: newQuantity,
            };
        });
    };


    const nextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };


    const prevPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };


    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };


    useEffect(() => {
        setCurrentPage(1);

        let updatedProducts = products.slice();

        // Filter products based on the search query first, if there is one
        if (query) {
            updatedProducts = updatedProducts.filter(product =>
                product.products.name.toLowerCase().includes(query.toLowerCase())
            );
        }

        // Filter products based on selected categories
        if (selectedCategories.length > 0) {
            updatedProducts = updatedProducts.filter(product =>
                selectedCategories.includes(product.products.categoryID.toString())
            );
        }

        // Sort products according to the sorting value
        updatedProducts = updatedProducts.sort((a, b) => {
            switch (sortValue) {
                case 'lowest-highest price':
                    return a.store_products.price - b.store_products.price;;
                case 'highest-lowest price':
                    return b.store_products.price - a.store_products.price;
                case 'az':
                    return a.products.name.localeCompare(b.products.name);
                case 'za':
                    return b.products.name.localeCompare(a.products.name);
                case 'relevance':
                    updatedProducts = products.slice();
                    return 0;
                default:
                    return 0;
            }
        });

        // Update the sorted and filtered product list
        setSortedAndFilteredProducts(updatedProducts);

        // Update total pages
        const total = Math.ceil(sortedAndFilteredProducts.length / itemsPerPage);
        setTotalPages(total);
        // Ensure current page is valid
        setCurrentPage(current => Math.max(1, Math.min(current, total)));

    }, [products, sortValue, selectedCategories, itemsPerPage]);


    return (
        <IonPage>
            <IonHeader>
                <IonToolbar className="toolbar" color="primary">
                    <div className="title-center">
                        <IonImg
                            src="680logocropped.png"
                            alt="App Logo"
                            className='headerLogo'
                        />
                    </div>
                    <IonSearchbar
                        value={query}
                        onIonChange={(e) => setQuery(e.detail.value!)}
                        onKeyUp={handleKeyDown}
                        onIonBlur={handleBlur}
                        placeholder="Search for products..."
                        debounce={300}
                        disabled={false}
                        className="searchbar" />
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <div className="categoryDropdown-container">
                    <IonItem>
                        <IonSelect
                            multiple={true}
                            value={selectedCategories}
                            onIonChange={(e) => setSelectedCategories(e.detail.value)}
                            label="Category"
                            labelPlacement="floating"

                        >
                            <IonSelectOption value="1">Fish</IonSelectOption>
                            <IonSelectOption value="2">Meat</IonSelectOption>
                            <IonSelectOption value="3">Frozen</IonSelectOption>
                            <IonSelectOption value="4">Fruit & Veg</IonSelectOption>
                            <IonSelectOption value="5">Bakery</IonSelectOption>
                            <IonSelectOption value="6">Deli</IonSelectOption>
                            <IonSelectOption value="7">Drinks</IonSelectOption>
                            <IonSelectOption value="8">Household</IonSelectOption>
                            <IonSelectOption value="9">Health & Body</IonSelectOption>
                            <IonSelectOption value="10">Beer & Wine</IonSelectOption>
                            <IonSelectOption value="11">Pantry</IonSelectOption>
                            <IonSelectOption value="12">Baby & Child</IonSelectOption>
                        </IonSelect>
                    </IonItem>
                </div>
                <div className="sortDropdown-container" ref={dropdownRef}>
                    <button
                        type="button"
                        className={`sortDropdown-toggle ${isDropdownOpen ? 'open' : ''}`}
                        onClick={toggleDropdown}
                    >
                        <span className="sortDropdown-selectedLabel">
                            {sortOptions.find((opt) => opt.value === sortValue)?.label ?? 'Most relevant'}
                        </span>
                        <span className="sortDropdown-chevron">&#9662;</span>
                    </button>
                    <div className={`sortDropdown-menu ${isDropdownOpen ? 'open' : ''}`} tabIndex={-1}>
                        {sortOptions.map((opt) => (
                            <div
                                key={opt.value}
                                className={`sortDropdown-item ${opt.value === sortValue ? 'selected' : ''}`}
                                onClick={() => selectSortOption(opt.value)}
                                role="button"
                                tabIndex={0}
                            >
                                {opt.label}
                            </div>
                        ))}
                    </div>
                </div>
                {searchAttempted && error && (
                    <div className="error-container">
                        <IonLabel className="error-message">{error}</IonLabel>
                    </div>
                )}
                {loading ? (<LoadingContainer />) : sortedAndFilteredProducts.length === 0 ? (
                    // Show "No results found" message if no products are returned
                    <div className="no-results-container">
                        <IonLabel>No results found</IonLabel>
                    </div>
                ) : (
                    // Display the grid of products if results exist
                    <div className="grid-container">
                        <IonGrid>
                            <IonRow>
                                {sortedAndFilteredProducts.slice(startIndex, startIndex + itemsPerPage).map((product, index) => {
                                    return (
                                        <IonCol
                                            size="6"
                                            size-sm="4"
                                            size-md="4"
                                            size-lg="3"
                                            size-xl='3'
                                            key={index}
                                            class="ion-no-margin"
                                        >
                                            <SearchProductCard
                                                decreaseQuantity={decreaseQuantity}
                                                increaseQuantity={increaseQuantity}
                                                quantities={quantities}
                                                product={product}
                                                productID={product.products.id}
                                                productBrand={product.products.brand}
                                                productDetails={product.products.details}
                                                productName={product.products.name}
                                                productPrice={product.store_products.price}
                                                productImage={product.products.image}
                                                openProductDetails={openProductDetails}
                                            />
                                        </IonCol>
                                    );
                                })}
                            </IonRow>
                        </IonGrid>
                    </div>
                )}
                {!loading && products.length > 0 && (<PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    nextPage={nextPage}
                    prevPage={prevPage}
                    goToPage={goToPage}
                />)}
                <ProductDetailsModal
                    decreaseQuantity={decreaseQuantity}
                    increaseQuantity={increaseQuantity}
                    quantities={quantities}
                    selectedProduct={selectedProduct}
                    showProductDetails={showProductDetails}
                    closeProductDetails={closeProductDetails}
                />
            </IonContent>
        </IonPage>
    );
};

export default SearchPage;
