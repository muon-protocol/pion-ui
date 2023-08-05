"use client";
import Image from "next/image";
import styles from "@/app/verification/presale/style.module.css";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useSignMessage } from "wagmi";
import { preSaleRequest } from "@/utils/requestVerifications";
import { useEffect, useState } from "react";
import {
  resetErrorMessage,
  setErrorMessage,
  setPresaleVerified,
} from "@/redux/features/verification";
import { ERRORCODE } from "@/utils/errorCodeMessage";
import { useDispatch, useSelector } from "react-redux";
import { BackToVerificationBtn } from "@/app/verification/presale/[walletAddress]/page";
import { LightBtn } from "@/app/page";
import { usePathname } from "next/navigation";

function Step1({ setStep }) {
  const { address, isConnecting, isDisconnected } = useAccount();
  const pathName = usePathname();
  const staker = pathName.split("presale/")[1];
  const dispatch = useDispatch();
  const { data, isError, isLoading, isSuccess, signMessage } = useSignMessage({
    message:
      "Please sign this message to verify ownership of your Ethereum address to verify its uniqueness for Muon.",
  });

  useEffect(() => {
    if (isSuccess) {
      console.log(data);
      preSaleRequest(staker, address, data)
        .then((res) => {
          dispatch(resetErrorMessage());
          console.log(res);
          if (res.data.success) {
            setStep(2);
            dispatch(setPresaleVerified(true));
          } else {
            setStep(3);
            dispatch(setErrorMessage(ERRORCODE[res.data.errorCode]("presale")));
          }
        })
        .catch((error) => {
          console.log(error);
          setStep(3);
        });
    }
  }, [isSuccess]);
  return (
    <div>
      <p className="mt-12">
        select the address you used for the presale. Then use the "Verify
        Address" button to verify the ownership of the address.
        {isLoading && "loading"} {isError && "error"} {isSuccess && "loading"}
      </p>
      <div className="w-full mt-8 flex justify-center">
        <ConnectButton></ConnectButton>
      </div>
      <div className="w-full mt-8">
        <div className="w-28 mx-auto">
          <button disabled={isLoading} onClick={() => signMessage()}>
            verify Address
          </button>
        </div>
      </div>
    </div>
  );
}

function Step2() {
  return (
    <div>
      <p>
        Congratulations! You passed Presale participants verification Your
        access granted to run Alice Starter node
      </p>
      <div className="w-full mt-8">
        <div className="w-28 mx-auto">
          <BackToVerificationBtn>
            Back to verification center
          </BackToVerificationBtn>
        </div>
      </div>
    </div>
  );
}

function Step3({ setStep }) {
  const selector = useSelector(
    (state) => state.rootReducer.verificationReducer
  );
  return (
    <div>
      <p className="mt-10 text-center">{selector.errorMessage}</p>

      <div className="flex justify-around mt-28">
        <BackToVerificationBtn>
          Back to verification center
        </BackToVerificationBtn>
        <LightBtn onClick={() => setStep(1)}>Try another address</LightBtn>
      </div>
    </div>
  );
}

export default function Presale() {
  const [step, setStep] = useState(1);
  const status = false;
  return (
    <div className="w-[570px] mt-2 rounded-[18px] bg-white min-h-[524px] px-8 py-4">
      <h2>Muon Presale Participation</h2>
      <div className="mx-auto mt-14 relative w-fit ">
        <Image
          className=""
          src={`/verification/wallet.svg`}
          width="90"
          height="81"
        ></Image>
        {step === 2 && (
          <Image
            className={`absolute ${styles.child_image}`}
            src={`/verification/Success.svg`}
            width="20"
            height="50"
          ></Image>
        )}
        {step === 3 && (
          <Image
            className={`absolute ${styles.child_image}`}
            src={`/verification/Rejected.svg`}
            width="20"
            height="50"
          ></Image>
        )}
      </div>
      {step === 1 && <Step1 setStep={setStep}></Step1>}
      {step === 2 && <Step2></Step2>}
      {step === 3 && <Step3 setStep={setStep}></Step3>}
    </div>
  );
}
