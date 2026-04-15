import { Mail } from "lucide-react";
import { useState } from "react";
import { Stone } from "../../components/background";
import Codes from "../../components/codes";

export default function Page() {
    const [codeVisible, setCodeVisible] = useState<boolean>(false);

    return (
        <>
            <div className="bio">
                <h1 style={{ display: "flex" }}>
                    <ruby>
                        满家<rt>Man</rt>
                    </ruby>
                    <ruby>
                        淇<rt>Iann</rt>
                    </ruby>
                </h1>
                <div className="content">
                    Usually I make code
                    <a onClick={() => setCodeVisible(true)} className="nav">
                        things
                    </a>
                    with design, and do
                    <a href="/photography" className="nav">
                        photography
                    </a>
                    around. <br />
                    Any ideas
                    <a href="mailto:502975759@qq.com" className="nav">
                        <Mail size={20} fill="var(--color-slight)" />
                    </a>
                    please.
                </div>
            </div>

            <Codes visible={codeVisible} onVisibleChange={setCodeVisible} />

            <Stone />
        </>
    );
}
