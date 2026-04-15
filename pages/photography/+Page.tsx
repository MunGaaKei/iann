import { useEffect, useRef, useState } from "react";
import Image from "../../components/image";
import { UndoIcon } from "../../components/svg/return";
import { baseUrl } from "../../components/utils";
import { images } from "./data";
import css from "./index.module.css";

function hashToUnit(input: string) {
    let hash = 2166136261;
    for (let i = 0; i < input.length; i++) {
        hash ^= input.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0) / 4294967296;
}

type PhotographyItem = (typeof images)[number];

function View(props: {
    visible: boolean;
    onVisibleChange: (visible: boolean) => void;
    item: PhotographyItem | null;
}) {
    const { visible, onVisibleChange, item } = props;

    if (!item) return null;
    const { loc, images } = item;

    return (
        <div
            className={`${css.view} ${visible ? css.visible : ""}`}
            onClick={() => onVisibleChange(false)}
        >
            <h2 className={css.locTitle}>{loc}</h2>

            {images.map((img, i) => {
                return <Image key={img} src={img} className={css.viewImage} />;
            })}
        </div>
    );
}

export default function Page() {
    const [viewVisible, setViewVisible] = useState(false);
    const [viewItem, setViewItem] = useState<PhotographyItem | null>(null);
    const [hoverLoc, setHoverLoc] = useState<string | null>(null);
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
    const rafRef = useRef<number | null>(null);
    const pendingPosRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    const scheduleCursorPos = (x: number, y: number) => {
        pendingPosRef.current = { x, y };
        if (rafRef.current) return;
        rafRef.current = requestAnimationFrame(() => {
            rafRef.current = null;
            setCursorPos(pendingPosRef.current);
        });
    };

    const handleMouseMove = (e: MouseEvent) => {
        const target = e.target as HTMLElement | null;
        const el = target?.closest?.(
            "[data-photography-loc]",
        ) as HTMLElement | null;
        const nextLoc = el?.dataset.photographyLoc ?? null;
        if (nextLoc !== hoverLoc) setHoverLoc(nextLoc);
        if (nextLoc) scheduleCursorPos(e.clientX, e.clientY);
    };

    return (
        <div className={css.page}>
            <h1 className={css.title}>Photography</h1>

            <a href={`${baseUrl}`} className={css.back}>
                <UndoIcon strokeWidth={3} />
            </a>

            <View
                visible={viewVisible}
                onVisibleChange={setViewVisible}
                item={viewItem}
            />

            <h2
                className={`${css.cursor} ${hoverLoc ? css.active : ""}`}
                style={{
                    transform: `translate3d(${cursorPos.x + 16}px, ${cursorPos.y + 16}px, 0)`,
                }}
            >
                {hoverLoc ?? ""}
            </h2>

            <div
                className={css.list}
                onMouseMove={(e) => handleMouseMove(e.nativeEvent)}
                onMouseLeave={() => setHoverLoc(null)}
            >
                {images.map((item, i) => {
                    const { loc, images } = item;

                    return (
                        <div
                            key={i}
                            className={css.item}
                            data-photography-loc={loc}
                        >
                            {images.map((img, j) => {
                                const unit = hashToUnit(`${img}:${i}:${j}`);
                                const deg = -12 + unit * 24;

                                return (
                                    <Image
                                        key={img}
                                        src={img}
                                        className={css.image}
                                        rootMargin="0px"
                                        style={{
                                            transform: `rotate(${deg}deg)`,
                                        }}
                                        onClick={() => {
                                            setViewVisible(true);
                                            setViewItem(item);
                                        }}
                                    />
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
