import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./BookDetails.css";

import {
  FaHeart,
  FaRegHeart,
  FaShoppingBasket,
  FaCheck,
  FaTimes,
  FaMinus,
  FaPlus,
  FaChevronRight,
  FaArrowLeft,
  FaShareAlt,
  FaTruck,
  FaShieldAlt,
  FaUndoAlt,
  FaBookOpen,
} from "react-icons/fa";

import {
  SHOP_PATH,
  products,
  getProductById,
  formatPrice,
  formatDate,
} from "./shopData";
import { useShopStore, useToast, toggleWishlist, addToCart } from "./useShopStore";

/* Edit these to match your real store policies */
const PROMISES = [
  { icon: FaTruck, title: "Fast dispatch", text: "Ordered books are packed and shipped quickly." },
  { icon: FaShieldAlt, title: "Secure packaging", text: "Every book is wrapped to arrive in perfect shape." },
  { icon: FaUndoAlt, title: "Easy support", text: "Questions about an order? Our team is here to help." },
];

const handleImageError = (event) => {
  event.currentTarget.style.visibility = "hidden";
  event.currentTarget.parentNode.classList.add("is-broken");
};

const BookDetails = () => {
  const { id } = useParams();
  const product = useMemo(() => getProductById(id), [id]);

  const { wishlist, cart, cartCount } = useShopStore();
  const [toast, showToast] = useToast();
  const [quantity, setQuantity] = useState(1);

  /* reset quantity and jump to top when the book changes */
  useEffect(() => {
    setQuantity(1);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [id]);

  const related = useMemo(() => {
    if (!product) return [];
    const sameCategory = products
      .filter((p) => p.category === product.category && p.id !== product.id)
      .sort((a, b) => b.popularity - a.popularity);
    const others = products
      .filter((p) => p.category !== product.category)
      .sort((a, b) => b.popularity - a.popularity);
    return [...sameCategory, ...others].slice(0, 4);
  }, [product]);

  /* ---------- not found ---------- */
  if (!product) {
    return (
      <section className="BookDetails">
        <div className="BookDetails__notFound">
          <div className="BookDetails__notFoundIcon">
            <FaBookOpen />
          </div>
          <h1>Book not found</h1>
          <p>The book you are looking for does not exist or may have been removed.</p>
          <Link to={SHOP_PATH} className="BookDetails__primaryBtn">
            <FaArrowLeft /> Back to shop
          </Link>
        </div>
      </section>
    );
  }

  const liked = wishlist.includes(product.id);
  const inCart = cart[product.id] || 0;

  const handleAdd = () => {
    if (!product.inStock) return;
    addToCart(product.id, quantity);
    showToast(`${quantity > 1 ? `${quantity} × ` : ""}"${product.title}" added to cart.`);
  };

  const handleWishlist = () => {
    const added = toggleWishlist(product.id);
    showToast(
      added ? "Added to your wishlist." : "Removed from your wishlist.",
      added ? "love" : "info"
    );
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: product.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        showToast("Link copied to clipboard.");
      }
    } catch (error) {
      /* user cancelled sharing or clipboard blocked */
    }
  };

  return (
    <section className="BookDetails">
      <div className="BookDetails__inner">
        {/* ---------- top row: breadcrumb + chips ---------- */}
        <div className="BookDetails__topRow">
          <nav className="BookDetails__crumbs" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <FaChevronRight aria-hidden="true" />
            <Link to={SHOP_PATH}>Shop</Link>
            <FaChevronRight aria-hidden="true" />
            <span aria-current="page">{product.title}</span>
          </nav>

          <div className="BookDetails__chips">
            <span className="BookDetails__chip" title="Wishlist">
              <FaHeart /> <b>{wishlist.length}</b>
            </span>
            <span className="BookDetails__chip" title="Cart">
              <FaShoppingBasket /> <b>{cartCount}</b>
            </span>
          </div>
        </div>

        {/* ---------- main ---------- */}
        <div className="BookDetails__main">
          {/* Cover stage */}
          <div className="BookDetails__stageWrap">
            <div className="BookDetails__stage">
              <div className="BookDetails__badges">
                {product.isTopSelling ? (
                  <span
                    className="BookDetails__badge BookDetails__badge--hot"
                    style={{
                      background: "linear-gradient(135deg, #f59e0b, #ea580c, #dc2626)",
                      fontWeight: 800,
                    }}
                  >
                    Top Selling
                  </span>
                ) : product.isBestSeller ? (
                  <span
                    className="BookDetails__badge BookDetails__badge--hot"
                    style={{
                      background: "linear-gradient(135deg, #ef4444, #dc2626)",
                      fontWeight: 800,
                    }}
                  >
                    Best Seller
                  </span>
                ) : null}
                {product.discount > 0 && (
                  <span className="BookDetails__badge BookDetails__badge--sale">
                    -{product.discount}%
                  </span>
                )}
              </div>

              <div className="BookDetails__cover">
                <img
                  key={product.id}
                  src={product.imageLarge}
                  alt={product.title}
                  onError={handleImageError}
                />
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="BookDetails__info">
            <Link
              to={SHOP_PATH}
              className="BookDetails__back"
            >
              <FaArrowLeft /> Back to shop
            </Link>

            <span className="BookDetails__category">{product.category}</span>
            <h1 className="BookDetails__title">{product.title}</h1>

            <div className="BookDetails__priceRow">
              <strong>{formatPrice(product.price)}</strong>
              {product.oldPrice && (
                <>
                  <del>{formatPrice(product.oldPrice)}</del>
                  <span className="BookDetails__save">Save {product.discount}%</span>
                </>
              )}
            </div>

            <p className="BookDetails__lead">{product.description}</p>

            <div className={`BookDetails__stock ${product.inStock ? "is-in" : "is-out"}`}>
              <i>{product.inStock ? <FaCheck /> : <FaTimes />}</i>
              {product.inStock ? "In stock and ready to ship" : "Currently out of stock"}
            </div>

            {/* Actions */}
            <div className="BookDetails__actions">
              <div className="BookDetails__qty" role="group" aria-label="Quantity">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <FaMinus />
                </button>
                <span aria-live="polite">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                  disabled={quantity >= 10}
                  aria-label="Increase quantity"
                >
                  <FaPlus />
                </button>
              </div>

              <button
                type="button"
                className="BookDetails__addBtn"
                onClick={handleAdd}
                disabled={!product.inStock}
              >
                <FaShoppingBasket />
                {product.inStock ? "Add to cart" : "Out of stock"}
              </button>

              <button
                type="button"
                className={`BookDetails__iconBtn ${liked ? "is-liked" : ""}`}
                onClick={handleWishlist}
                aria-pressed={liked}
                aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
                title={liked ? "Remove from wishlist" : "Add to wishlist"}
              >
                {liked ? <FaHeart /> : <FaRegHeart />}
              </button>

              <button
                type="button"
                className="BookDetails__iconBtn"
                onClick={handleShare}
                aria-label="Share this book"
                title="Share"
              >
                <FaShareAlt />
              </button>
            </div>

            {inCart > 0 && (
              <p className="BookDetails__cartNote">
                <FaCheck /> {inCart} {inCart === 1 ? "copy" : "copies"} in your cart
              </p>
            )}

            {/* Promises */}
            <ul className="BookDetails__promises">
              {PROMISES.map(({ icon: Icon, title, text }) => (
                <li key={title}>
                  <span className="BookDetails__promiseIcon">
                    <Icon />
                  </span>
                  <div>
                    <strong>{title}</strong>
                    <p>{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ---------- about + details ---------- */}
        <div className="BookDetails__lower">
          <div className="BookDetails__panel">
            <h2 className="BookDetails__panelTitle">About this book</h2>
            <p className="BookDetails__about">{product.description}</p>
            <p className="BookDetails__about">
              “{product.title}” is part of our {product.category.toLowerCase()} collection.
              Browse the rest of the shelf below to find your next read.
            </p>
          </div>

          <div className="BookDetails__panel">
            <h2 className="BookDetails__panelTitle">Book details</h2>
            <dl className="BookDetails__specs">
              <div>
                <dt>Category</dt>
                <dd>{product.category}</dd>
              </div>
              <div>
                <dt>Availability</dt>
                <dd className={product.inStock ? "is-in" : "is-out"}>
                  {product.inStock ? "In stock" : "Out of stock"}
                </dd>
              </div>
              <div>
                <dt>Added on</dt>
                <dd>{formatDate(product.latestDate)}</dd>
              </div>
              <div>
                <dt>Book code</dt>
                <dd>{product.sku}</dd>
              </div>
              <div>
                <dt>Price</dt>
                <dd>{formatPrice(product.price)}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* ---------- related ---------- */}
        <div className="BookDetails__related">
          <div className="BookDetails__relatedHead">
            <h2>You may also like</h2>
            <Link to={SHOP_PATH}>
              View all books <FaChevronRight />
            </Link>
          </div>

          <div className="BookDetails__relatedGrid">
            {related.map((book) => (
              <Link key={book.id} to={`${SHOP_PATH}/${book.id}`} className="BookDetails__relCard">
                <div className="BookDetails__relMedia">
                  <div className="BookDetails__relCover">
                    <img src={book.image} alt="" loading="lazy" onError={handleImageError} />
                  </div>
                </div>
                <div className="BookDetails__relInfo">
                  <span>{book.category}</span>
                  <h3>{book.title}</h3>
                  <strong>{formatPrice(book.price)}</strong>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile sticky bar */}
      <div className="BookDetails__sticky">
        <div>
          <span>Price</span>
          <strong>{formatPrice(product.price)}</strong>
        </div>
        <button type="button" onClick={handleAdd} disabled={!product.inStock}>
          <FaShoppingBasket />
          {product.inStock ? "Add to cart" : "Out of stock"}
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`BookDetails__toast is-${toast.type}`} role="status">
          {toast.type === "love" ? <FaHeart /> : <FaCheck />}
          <p>{toast.message}</p>
        </div>
      )}
    </section>
  );
};

export default BookDetails;