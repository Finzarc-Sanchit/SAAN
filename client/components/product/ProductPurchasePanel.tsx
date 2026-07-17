"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/components/providers/CartProvider";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { ProductColorDisplay } from "@/components/product/ProductColorDisplay";
import { RatingStars } from "@/components/product/RatingStars";
import { ProductQuantitySelector } from "@/components/product/ProductQuantitySelector";
import { ProductSizeSelector } from "@/components/product/ProductSizeSelector";
import { SizeGuideModal } from "@/components/product/SizeGuideModal";
import { CtaButton } from "@/components/ui/CtaButton";
import { addCartItem } from "@/lib/api/cart";
import { listSizes } from "@/lib/api/sizes";
import { writeBuyNowItem } from "@/lib/checkout/buy-now-storage";
import type { ProductDetail } from "@/lib/product-defaults";
import {
  findSizeIdByLabel,
  findSizeLabelById,
} from "@/lib/product-size-catalog";
import { getProductHref, getVariantFromSearchParams } from "@/lib/product-url";
import { formatPrice, getDiscountPercent } from "@/lib/site-content";

type ProductPurchasePanelProps = {
  product: ProductDetail;
};

export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem } = useCart();
  const { requireAuth, isAuthenticated } = useRequireAuth();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  const sizeCatalogQuery = useQuery({
    queryKey: ["sizes", "catalog"],
    queryFn: listSizes,
    staleTime: 5 * 60_000,
  });

  const sizeCatalog = sizeCatalogQuery.data ?? [];
  const currency = product.currency ?? "INR";
  const oneLineDescription = product.subtitle;
  const hasDiscount = product.mrp > product.price;
  const discountPercent = hasDiscount
    ? getDiscountPercent(product.price, product.mrp)
    : 0;
  const availableQuantity = selectedSize
    ? Math.max(1, Math.min(10, product.sizeStock[selectedSize] ?? 10))
    : 10;

  useEffect(() => {
    const variant = getVariantFromSearchParams(searchParams);
    if (!variant || sizeCatalog.length === 0) {
      return;
    }

    const label = findSizeLabelById(sizeCatalog, variant);
    if (label && product.sizes.includes(label)) {
      setSelectedSize(label);
    }
  }, [searchParams, sizeCatalog, product.sizes]);

  function syncVariantInUrl(sizeLabel: string | null) {
    if (!sizeLabel) {
      router.replace(getProductHref(product.slug), { scroll: false });
      return;
    }

    const sizeId =
      product.sizeIdByLabel?.[sizeLabel] ?? findSizeIdByLabel(sizeCatalog, sizeLabel);
    if (!sizeId) {
      return;
    }

    router.replace(getProductHref(product.slug, { variant: sizeId }), {
      scroll: false,
    });
  }

  function resolveSelectedSizeId(): string | null {
    if (!selectedSize) return null;
    return (
      product.sizeIdByLabel?.[selectedSize] ??
      findSizeIdByLabel(sizeCatalog, selectedSize) ??
      null
    );
  }

  function handleAddToCart() {
    if (!product.sizeIdByLabel) {
      setSizeError(true);
      return;
    }

    if (!selectedSize) {
      setSizeError(true);
      return;
    }

    const sizeId = resolveSelectedSizeId();
    if (!sizeId) {
      setSizeError(true);
      return;
    }

    setSizeError(false);
    // Guests keep the line in localStorage; login syncs it to the server cart.
    addItem({
      productId: product.id,
      sizeId,
      name: product.name,
      price: product.price,
      currency,
      image: product.image,
      size: selectedSize,
      quantity,
    });

    if (isAuthenticated) {
      void addCartItem({
        productId: product.id,
        sizeId,
        quantity,
      }).catch(() => {
        // Local cart remains the source of truth if the server write fails.
      });
    }
  }

  function handleBuyNow() {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }

    if (!product.sizeIdByLabel) {
      setSizeError(true);
      return;
    }

    const sizeId = resolveSelectedSizeId();
    if (!sizeId) {
      setSizeError(true);
      return;
    }

    setSizeError(false);
    addItem({
      productId: product.id,
      sizeId,
      name: product.name,
      price: product.price,
      currency,
      image: product.image,
      size: selectedSize,
      quantity,
    });
    writeBuyNowItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      mrp: product.mrp,
      currency,
      image: product.image,
      sizeLabel: selectedSize,
      sizeId,
      quantity,
    });

    if (isAuthenticated) {
      void addCartItem({
        productId: product.id,
        sizeId,
        quantity,
      }).catch(() => {
        // Local cart remains if the server write fails.
      });
    }

    requireAuth(() => {
      router.push("/checkout/bag");
    });
  }

  return (
    <>
      <h1 className="text-h2 text-ink">{product.name}</h1>

      <a
        href="#product-reviews"
        className="mt-3 inline-flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        aria-label={`${product.rating.toFixed(1)} out of 5 stars from ${product.reviewCount} reviews`}
      >
        <RatingStars rating={product.rating} />
        <span className="text-caption text-neutral-500">
          {product.rating.toFixed(1)} · {product.reviewCount}{" "}
          {product.reviewCount === 1 ? "review" : "reviews"}
        </span>
      </a>

      {hasDiscount ? (
        <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <p className="text-h3 text-ink">
            {formatPrice(product.price, currency)}
          </p>
          <p className="text-body text-neutral-500 line-through decoration-1">
            {formatPrice(product.mrp, currency)}
          </p>
          <p className="text-ui bg-[#047857] px-2.5 py-1 text-white">
            {discountPercent}% off
          </p>
        </div>
      ) : (
        <p className="text-body-medium mt-3 text-ink">
          {formatPrice(product.price, currency)}
        </p>
      )}

      <p className="text-body mt-4 text-neutral-700">{oneLineDescription}</p>

      <ProductSizeSelector
        sizes={product.sizes.filter((size) => size !== "CUSTOM")}
        selectedSize={selectedSize}
        onSelect={(size) => {
          setSelectedSize(size);
          setQuantity((current) =>
            Math.min(
              current,
              Math.max(1, Math.min(10, product.sizeStock[size] ?? 10)),
            ),
          );
          setSizeError(false);
          syncVariantInUrl(size);
        }}
        onOpenSizeGuide={() => setSizeGuideOpen(true)}
      />

      <ProductColorDisplay label={product.colourLabel} />

      <ProductQuantitySelector
        quantity={quantity}
        onChange={setQuantity}
        max={availableQuantity}
      />

      {sizeError && (
        <p className="text-caption mt-3 text-error" role="alert">
          {!product.sizeIdByLabel
            ? "This piece is not available for purchase yet."
            : "Please select a size before continuing."}
        </p>
      )}

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <CtaButton
          type="button"
          variant="secondary"
          onClick={handleAddToCart}
          className="group w-full duration-500 ease-[var(--ease-luxury)] motion-reduce:transition-none [&>span]:transition-transform [&>span]:duration-500 [&>span]:ease-[var(--ease-luxury)] hover:[&>span]:translate-x-1 motion-reduce:[&>span]:transform-none"
        >
          Add to Cart
        </CtaButton>
        <CtaButton
          type="button"
          variant="secondary"
          onClick={handleBuyNow}
          className="w-full !border-ink !bg-ink !text-paper shadow-none transition-[box-shadow,transform] duration-500 ease-[var(--ease-luxury)] hover:-translate-y-0.5 hover:!border-ink hover:!bg-ink hover:!text-paper hover:shadow-[0_10px_24px_rgba(11,10,9,0.14)] motion-reduce:transform-none motion-reduce:transition-none"
        >
          Buy Now
        </CtaButton>
      </div>

      <SizeGuideModal
        isOpen={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
      />
    </>
  );
}
