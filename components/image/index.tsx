import { ImgHTMLAttributes, useEffect, useRef, useState } from "react";
import css from "./index.module.css";

export type ImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
    src: string;
    rootMargin?: string;
};

type ObserverBucket = {
    observer: IntersectionObserver;
    callbacks: Map<Element, () => void>;
};

const buckets = new Map<string, ObserverBucket>();

function getBucket(rootMargin: string) {
    const existing = buckets.get(rootMargin);
    if (existing) return existing;

    const callbacks = new Map<Element, () => void>();
    const observer = new IntersectionObserver(
        (entries) => {
            for (const entry of entries) {
                if (!entry.isIntersecting && entry.intersectionRatio <= 0)
                    continue;
                const cb = callbacks.get(entry.target);
                if (!cb) continue;
                callbacks.delete(entry.target);
                observer.unobserve(entry.target);
                cb();
            }

            if (callbacks.size === 0) {
                observer.disconnect();
                buckets.delete(rootMargin);
            }
        },
        { root: null, rootMargin, threshold: 0.01 },
    );

    const bucket = { observer, callbacks };
    buckets.set(rootMargin, bucket);
    return bucket;
}

export default function Image(props: ImageProps) {
    const {
        src,
        className,
        style,
        onLoad,
        width,
        height,
        rootMargin,
        ...rest
    } = props;
    const containerRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const [inView, setInView] = useState(false);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        setLoaded(false);
    }, [src]);

    useEffect(() => {
        if (inView) return;
        const el = containerRef.current;
        if (!el) return;

        if (
            typeof window === "undefined" ||
            typeof IntersectionObserver === "undefined"
        ) {
            setInView(true);
            return;
        }

        const bucket = getBucket(rootMargin ?? "120px");
        bucket.callbacks.set(el, () => setInView(true));
        bucket.observer.observe(el);

        return () => {
            bucket.callbacks.delete(el);
            bucket.observer.unobserve(el);
            if (bucket.callbacks.size === 0) {
                bucket.observer.disconnect();
                buckets.delete(rootMargin ?? "120px");
            }
        };
    }, [inView, rootMargin]);

    useEffect(() => {
        if (!inView) return;
        const img = imgRef.current;
        if (!img) return;
        if (img.complete && img.naturalWidth > 0) setLoaded(true);
    }, [inView, src]);

    return (
        <div
            ref={containerRef}
            className={`${css.container} ${loaded ? css.loaded : ""} ${className ?? ""}`}
            style={{
                ...style,
                width,
                height,
            }}
        >
            <img
                ref={imgRef}
                src={inView ? src : undefined}
                className={css.image}
                loading="lazy"
                decoding="async"
                onLoad={(e) => {
                    setLoaded(true);
                    onLoad?.(e);
                }}
                {...rest}
            />
        </div>
    );
}
