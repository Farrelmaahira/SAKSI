import { useEffect, useState } from "react";
import { BASE_VALUE } from "@/data/simulator";
import { contractText } from "@/lib/contracts/contract-text";
import { sha256 } from "@/lib/contracts/sha256";
import { buildSimContract } from "@/lib/simulator/build-sim-contract";
import { randomHex } from "@/lib/simulator/random-hex";

/* Step 4 of the simulator: seal the contract with SHA-256, then change a value to see the hash break. */
export function useSimSeal(code: string, placed: string[]) {
  const [sealed, setSealed] = useState("");
  const [scramble, setScramble] = useState("");
  const [value, setValue] = useState(BASE_VALUE);
  const [liveHash, setLiveHash] = useState("");

  useEffect(() => {
    if (!sealed) return;
    let alive = true;
    sha256(contractText(buildSimContract(code, placed, value))).then(
      (h) => alive && setLiveHash(h),
    );
    return () => {
      alive = false;
    };
  }, [code, placed, value, sealed]);

  const seal = async () => {
    const h = await sha256(
      contractText(buildSimContract(code, placed, BASE_VALUE)),
    );
    let i = 0;
    const t = setInterval(() => {
      i += 1;
      setScramble(randomHex(64));
      if (i > 16) {
        clearInterval(t);
        setSealed(h);
        setLiveHash(h);
      }
    }, 40);
  };

  const reset = () => {
    setSealed("");
    setScramble("");
    setValue(BASE_VALUE);
    setLiveHash("");
  };

  return {
    sealed,
    scramble,
    value,
    liveHash,
    setValue,
    restore: () => setValue(BASE_VALUE),
    seal,
    reset,
  };
}
