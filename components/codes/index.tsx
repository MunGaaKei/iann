import { Link2 } from "lucide-react";
import {
    Dispatch,
    SetStateAction,
    type WheelEvent,
    useRef,
    useState,
} from "react";
import Image from "../image";
import { UndoIcon } from "../svg/return";
import { projects } from "./constant";
import css from "./index.module.css";

export type CodesProps = {
    visible: boolean;
    onVisibleChange: Dispatch<SetStateAction<boolean>>;
};

export default function Codes(props: CodesProps) {
    const { visible, onVisibleChange } = props;
    const [index, setIndex] = useState(0);
    const lastWheelAtRef = useRef(0);

    const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
        const delta =
            Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;

        if (delta === 0) return;
        if (Math.abs(delta) < 8) return;

        const now = Date.now();
        if (now - lastWheelAtRef.current < 350) return;
        lastWheelAtRef.current = now;

        setIndex((prev) => {
            const len = projects.length;
            if (len === 0) return 0;

            const next = prev + (delta > 0 ? 1 : -1);
            return Math.min(len - 1, Math.max(0, next));
        });
    };

    return (
        <div
            className={`${css.container} ${visible ? css.visible : ""}`}
            aria-hidden={!visible}
            onWheel={handleWheel}
        >
            {visible && (
                <>
                    <div className={css.corners}>
                        <span>✦</span>
                        <span className={css.uchiha}>◒</span>
                        <span>♯ iannism</span>
                        <span>
                            {index + 1} / {projects.length} ✦
                        </span>
                    </div>

                    <a
                        onClick={() => onVisibleChange(false)}
                        className={css.return}
                    >
                        <UndoIcon strokeWidth={3} size={32} />
                    </a>

                    <div className={css.track}>
                        <div
                            className={css.list}
                            style={{
                                transform: `translate3d(${-index * 50}vw, 0, 0)`,
                            }}
                        >
                            {projects.map((project, i) => {
                                return (
                                    <div
                                        className={`${css.project} ${
                                            i === index ? css.active : ""
                                        }`}
                                        key={project.name}
                                        onClick={() => {
                                            setIndex(i);
                                        }}
                                    >
                                        <Image
                                            src={project.logo}
                                            alt={project.name}
                                            width={94}
                                            height={94}
                                        />
                                        <h4>{project.name}</h4>

                                        <div className={css.desc}>
                                            <a
                                                href={project.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`${css.link}`}
                                            >
                                                <Link2 size={24} /> visit
                                            </a>

                                            <div>{project.desc}</div>

                                            <div className={css.images}>
                                                {project.images?.map((img) => {
                                                    return (
                                                        <Image
                                                            key={img}
                                                            src={img}
                                                            alt={project.name}
                                                            className={
                                                                css.image
                                                            }
                                                        />
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            <i className={css.continue}>TO BE CONTINUE</i>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
