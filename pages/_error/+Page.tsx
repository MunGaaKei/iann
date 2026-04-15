import { baseUrl } from "../../components/utils";
import css from "./index.module.css";

export default function Page() {
    return (
        <div className={css.page}>
            <h1>
                <span>404</span> Not Found
            </h1>

            <a href={`${baseUrl}`} className={`${css.back} nav`}>
                BACK
            </a>
        </div>
    );
}
