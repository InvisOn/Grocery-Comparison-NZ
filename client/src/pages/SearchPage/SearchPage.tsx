import { 
  IonContent,
  IonHeader,
  IonPage,
  IonList,
  IonTitle,
  IonToolbar,
  IonSearchbar,
  IonCard,
  IonCardContent,
  IonLabel,
  IonItem,
  IonIcon,
  IonImg,
  IonModal,
  IonThumbnail,
  useIonViewWillEnter,
  IonChip,
  IonGrid,
  IonCol,
  IonRow,
  IonCardTitle,
  IonButtons,
  IonButton,
  IonBadge,
} from '@ionic/react';
import ExploreContainer from '../../components/SharedComponents/ExploreContainer';
import './SearchPage.css';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { add, remove, arrowForward, arrowBack, syncOutline, cartOutline } from 'ionicons/icons';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PriceHistory {
  date: Date;
  price: number;
}

interface PriceHistoryData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension: number;
  }>;
}

interface CartItem {
  product: any;
  quantity: number;
}

const SearchPage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [addedToCart, setAddedToCart] = useState<{ [key: string]: boolean }>({});

  const [loading, setLoading] = useState<boolean>(true);
  const [query, setQuery] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [searchAttempted, setSearchAttempted] = useState<boolean>(false);

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showProductDetails, setShowProductDetails] = useState(false);

  // 价格历史
  const [dailyPriceHistory, setDailyPriceHistory] = useState<PriceHistory[]>([]);
  const [filteredPriceHistory, setFilteredPriceHistory] = useState<PriceHistory[]>([]);
  const [timeRange, setTimeRange] = useState('3M');

  // 下拉框状态
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [sortValue, setSortValue] = useState('relevance'); // 默认 "Most relevant"
  const sortOptions = [
    // TODO: change value
    { label: 'Most relevant', value: 'relevance' },
    { label: 'Most recent', value: 'recent' },
    { label: 'Alphabetical A-Z', value: 'az' },
    { label: 'Alphabetical Z-A', value: 'za' },
    { label: 'discounts L-H', value: 'lowd to highd' },
    { label: 'discounts H-L', value: 'highd to lowd' },
    { label: 'popularity L-H', value: 'lowp to highp' },
    { label: 'popularity H-L', value: 'highp to lowp' },
    { label: 'distance L-H', value: 'lowe to highe' },
    { label: 'distance H-L', value: 'highe to lowe' },
    { label: 'weight or volume L-H', value: 'loww to highw' },
    { label: 'weight or volume H-L', value: 'highw to loww' },
    { label: 'Lowest to highest unit price', value: 'lowest-highest' }, // 新增选项
    { label: 'Highest to lowest unit price', value: 'highest-lowest' }, // 新增选项
  ];
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 从 localStorage 加载购物车数据
  useEffect(() => {
    const storedAddedToCart = localStorage.getItem('addedToCart');
    const storedQuantities = localStorage.getItem('quantities');
    if (storedAddedToCart) {
      setAddedToCart(JSON.parse(storedAddedToCart));
    }
    if (storedQuantities) {
      setQuantities(JSON.parse(storedQuantities));
    }
  }, []);

  // 每次 addedToCart 或 quantities 变化时保存到 localStorage
  useEffect(() => {
    localStorage.setItem('addedToCart', JSON.stringify(addedToCart));
  }, [addedToCart]);

  useEffect(() => {
    localStorage.setItem('quantities', JSON.stringify(quantities));
  }, [quantities]);

  useIonViewWillEnter(async () => {
    setLoading(true);
    try {
      const fetchedProducts = await getData();
      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  });

  const getData = async () => {
    const response = await fetch('https://jsonplaceholder.typicode.com/photos?albumId=2');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const fetchedProducts = await response.json();

    return fetchedProducts;
  };

  // 点击外部收起下拉
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

  const handleSearch = () => {
    setSearchAttempted(true);
    if (query.length < 3 || query.length > 50) {
      setError('Search query must be between 3 and 50 characters.');
      return;
    }
    setError('');
    console.log('Performing search for:', query);
    // 真实搜索逻辑可写在这里
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleBlur = () => {
    handleSearch();
  };

  // 切换下拉
  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  // 选中某个排序选项
  const selectSortOption = (value: string) => {
    setSortValue(value);
    setIsDropdownOpen(false);
    console.log('You selected sort:', value);
    // TODO: 在此编写真正的排序逻辑
  };

  const openProductDetails = (product: any) => {
    setSelectedProduct(product);
    setShowProductDetails(true);
  };

  const closeProductDetails = () => {
    setShowProductDetails(false);
    setSelectedProduct(null);
  };

  // 添加商品到购物车
  const handleAddToCart = (productId: string) => {
    setAddedToCart((prev) => ({
      ...prev,
      [productId]: true,
    }));
    // 如果商品数量为0，则设置为1
    setQuantities((prev) => ({
      ...prev,
      [productId]: prev[productId] > 0 ? prev[productId] : 1,
    }));
  };

  const increaseQuantity = (productId: string) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [productId]: prevQuantities[productId] + 1,
    }));
  };

  const decreaseQuantity = (productId: string) => {
    setQuantities((prevQuantities) => {
      // 1) 先读取旧的数量
      const oldQuantity = prevQuantities[productId] || 0;
      // 2) 减少数量，不让它低于 0
      const newQuantity = Math.max(oldQuantity - 1, 0);
  
      // 3) 更新购物车状态：若 newQuantity > 0 则在购物车中，若 == 0 则移除
      setAddedToCart((prev) => ({
        ...prev,
        [productId]: newQuantity > 0,
      }));
  
      // 4) 返回新的 quantities 以更新状态
      return {
        ...prevQuantities,
        [productId]: newQuantity,
      };
    });
  };
  

  // 生成假数据的价格历史
  useEffect(() => {
    const generateDummyData = () => {
      const today = new Date();
      const prices: PriceHistory[] = [];
      for (let i = 0; i < 365; i++) {
        const randomPrice = 10 + Math.random() * 5;
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        prices.push({ date, price: parseFloat(randomPrice.toFixed(2)) });
      }
      setDailyPriceHistory(prices.reverse());
    };
    generateDummyData();
  }, []);

  // 根据 timeRange 筛选 dailyPriceHistory
  useEffect(() => {
    const filterDataByRange = () => {
      const ranges: Record<string, number> = {
        '1M': 30,
        '3M': 90,
        '6M': 180,
        '12M': 365,
      };
      const days = ranges[timeRange] || 365;
      const filtered = dailyPriceHistory.slice(-days);
      setFilteredPriceHistory(filtered);
    };
    filterDataByRange();
  }, [timeRange, dailyPriceHistory]);

  const priceHistoryData: PriceHistoryData = {
    labels: filteredPriceHistory.map((entry) =>
      entry.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ),
    datasets: [
      {
        label: 'Price History',
        data: filteredPriceHistory.map((entry) => entry.price),
        borderColor: '#7371FC',
        backgroundColor: 'rgba(75,192,192,0.2)',
        tension: 0.4,
      },
    ],
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          {/* 搜索栏 */}
          <IonSearchbar
            value={query}
            onIonChange={(e) => setQuery(e.detail.value!)}
            onKeyDown={handleKeyDown}
            onIonBlur={handleBlur}
            placeholder="Search for products..."
            debounce={300}
            className="searchbar"
          />
          {/* 购物车按钮 */}
          <IonButtons slot="end">
            <IonButton onClick={() => window.location.href = '/shoppinglist'} style={{ position: 'relative' }}>
              <IonIcon icon={cartOutline} />
              {Object.keys(addedToCart).filter((key) => addedToCart[key]).length > 0 && (
                <IonBadge color="danger">
                  {Object.keys(addedToCart).filter((key) => addedToCart[key]).length}
                </IonBadge>
              )}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {/* 下拉容器（在搜索栏下方） */}
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
          <div
            className={`sortDropdown-menu ${isDropdownOpen ? 'open' : ''}`}
            tabIndex={-1}
          >
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

        {loading ? (
          <div className="loading-container">
            <IonIcon className="loading-spinner" icon={syncOutline} />
            <IonLabel className="loading-message">Fetching results...</IonLabel>
          </div>
        ) : products.length === 0 ? (
          <div className="no-results-container">
            <IonLabel>No results found</IonLabel>
          </div>
        ) : (
          <div className="grid-container">
            <IonGrid>
              <IonRow>
                {products.map((product) => (
                  <IonCol
                    size="6"
                    size-sm="4"
                    size-md="4"
                    size-lg="3"
                    key={product.id}
                    className="ion-no-margin"
                  >
                    <IonCard className="listCard">
                      <IonImg
                        src={product.thumbnailUrl}
                        alt={product.title}
                        className="productImage"
                        onClick={() => openProductDetails(product)}
                      />
                      <IonCardContent>
                        <IonCardTitle
                          className="one-line-title"
                          onClick={() => openProductDetails(product)}
                        >
                          {product.title}
                        </IonCardTitle>

                        <div className="productDetails">
                          <div>
                            <IonLabel className="brandSize">Brand</IonLabel>
                            <IonLabel className="brandSize">100g</IonLabel>
                          </div>

                          <IonLabel className="priceLabel">$10.00</IonLabel>
                          {quantities[product.id] > 0 ? (
                            <div className="quantityControls">
                              <IonButton
                                shape="round"
                                className="controlButton"
                                aria-label="Decrease quantity"
                                onClick={() => decreaseQuantity(product.id)}
                                disabled={quantities[product.id] === 0}
                              >
                                <IonIcon slot="icon-only" icon={remove} />
                              </IonButton>
                              <p className="quantityText">{quantities[product.id]}</p>
                              <IonButton
                                shape="round"
                                className="controlButton"
                                aria-label="Increase quantity"
                                onClick={() => increaseQuantity(product.id)}
                              >
                                <IonIcon slot="icon-only" icon={add} />
                              </IonButton>
                            </div>
                          ) : (
                            <IonButton
                              onClick={() => handleAddToCart(product.id.toString())}
                              className="controlButton"
                            >
                              Add
                            </IonButton>
                          )}
                        </div>
                      </IonCardContent>
                    </IonCard>
                  </IonCol>
                ))}
              </IonRow>
            </IonGrid>
          </div>
        )}

        {!loading && products.length > 0 && (
          <div className="pagination">
            <IonButton shape="round" className="controlButton">
              <IonIcon slot="icon-only" icon={arrowBack} />
            </IonButton>
            <span>Page 1 of 5</span>
            <IonButton shape="round" className="controlButton">
              <IonIcon slot="icon-only" icon={arrowForward} />
            </IonButton>
          </div>
        )}

        {/* 商品详情模态框 */}
        <IonModal isOpen={showProductDetails} onDidDismiss={closeProductDetails}>
          <IonHeader>
            <IonToolbar color="primary">
              <IonButtons slot="start">
                <IonButton onClick={closeProductDetails}>Close</IonButton>
              </IonButtons>
              <IonTitle>Product Details</IonTitle>
            </IonToolbar>
          </IonHeader>

          <IonContent>
            {selectedProduct ? (
              <div style={{ padding: '16px' }}>
                <IonRow>
                  <h2>{selectedProduct.title}</h2>
                </IonRow>
                <IonRow>
                  <IonImg src={selectedProduct.thumbnailUrl} />
                  <div className="productDetails">
                    <div>
                      <IonLabel className="brandSize">Brand</IonLabel>
                      <IonLabel className="brandSize">100g</IonLabel>
                    </div>
                    <IonLabel className="priceLabel">$10.00</IonLabel>
                    {quantities[selectedProduct.id] > 0 ? (
                      <div className="quantityControls">
                        <IonButton
                          shape="round"
                          className="controlButton"
                          aria-label="Decrease quantity"
                          onClick={() => decreaseQuantity(selectedProduct.id)}
                          disabled={quantities[selectedProduct.id] === 0}
                        >
                          <IonIcon slot="icon-only" icon={remove} />
                        </IonButton>
                        <p className="quantityText">{quantities[selectedProduct.id]}</p>
                        <IonButton
                          shape="round"
                          className="controlButton"
                          aria-label="Increase quantity"
                          onClick={() => increaseQuantity(selectedProduct.id)}
                        >
                          <IonIcon slot="icon-only" icon={add} />
                        </IonButton>
                      </div>
                    ) : (
                      <IonButton
                        onClick={() => handleAddToCart(selectedProduct.id.toString())}
                        className="controlButton"
                      >
                        Add
                      </IonButton>
                    )}
                  </div>
                </IonRow>

                <IonRow>
                  <Line data={priceHistoryData} />
                </IonRow>

                <IonRow style={{ justifyContent: 'center', marginBottom: '16px' }}>
                  {['1M', '3M', '6M', '12M'].map((range) => (
                    <IonButton
                      key={range}
                      color={timeRange === range ? 'primary' : 'medium'}
                      onClick={() => setTimeRange(range)}
                    >
                      {range}
                    </IonButton>
                  ))}
                </IonRow>

                <IonRow>
                  <IonList style={{ width: '100%' }}>
                    {products.map((p) => (
                      <IonItem key={p.id}>
                        <IonCol size="11">{p.title}</IonCol>
                        <IonCol size="1">${p.id}</IonCol>
                      </IonItem>
                    ))}
                  </IonList>
                </IonRow>

                <IonLabel>
                  <h1>Description</h1>
                  <p>
                    Paragraph Paragraph Paragraph Paragraph Paragraph Paragraph Paragraph Paragraph
                    Paragraph Paragraph
                  </p>
                </IonLabel>
              </div>
            ) : (
              <p>Loading...</p>
            )}
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default SearchPage;
