import useClaimPrize from '../../contexts/ClaimPrize/useActions.ts';
import useUserProfile from '../../contexts/UserProfile/useUserProfile.ts';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatWalletAddress } from '../../utils/web3.ts';
import { getCurrentChainId } from '../../constants/chains.ts';
import Modal from '../../components/Common/Modal.tsx';
import { PrizeCalculationDetailModal } from './PrizeCalculationDetailModal.tsx';

const ClaimCard = () => {
  const { totalRewards, stakingAddress } = useClaimPrize();
  const { walletAddress } = useUserProfile();
  const {
    eligibleAddresses,
    isMetamaskLoading,
    isTransactionLoading,
    isSuccess,
    alreadyClaimedPrize,
    setAlreadyClaimedPrize,
    stakingAddressFromPast,
    totalRewardFromPast,
    claimSignatureFromPast,
    handleClaimRewardsFromPastClicked,
    handleClaimRewardsClicked,
    isConfirmModalOpen,
    setIsConfirmModalOpen,
    handleConfirmClaimClicked,
    rewardWalletsFromPast,
  } = useClaimPrize();
  const { chainId, handleSwitchNetwork } = useUserProfile();

  const [
    isPrizeCalculationDetailModalOpen,
    setIsPrizeCalculationDetailModalOpen,
  ] = useState(false);

  const isClaimButtonDisabled = useMemo(() => {
    return (
      !stakingAddressFromPast &&
      (eligibleAddresses.length === 0 ||
        eligibleAddresses.some((wallet) => !wallet.signature))
    );
  }, [eligibleAddresses, stakingAddressFromPast]);

  const navigate = useNavigate();

  useEffect(() => {
    if (isSuccess || alreadyClaimedPrize) {
      navigate('/review');
      setAlreadyClaimedPrize(false);
    }
  }, [isSuccess, navigate, alreadyClaimedPrize, setAlreadyClaimedPrize]);

  return (
    <div className="w-full bg-primary-13 pl-11 pr-9 pb-7 pt-8 rounded-2xl flex text-white">
      <div className="claim-card__left flex-[4]">
        <p className="mb-8 font-semibold text-[20px]">Your Bonded ALICE</p>
        <span className="flex justify-between font-light mb-3">
          <p>Staking address:</p>
          <p className="font-semibold">
            {stakingAddressFromPast
              ? formatWalletAddress(stakingAddressFromPast)
              : walletAddress
              ? formatWalletAddress(stakingAddress)
              : 'connect wallet'}
          </p>
        </span>
        <span className="flex justify-between font-light mb-3">
          <p className="flex gap-1">
            <p className="font-semibold">
              {stakingAddressFromPast
                ? totalRewardFromPast.dsp
                : totalRewards.dsp}
            </p>
            ALICE
            <img
              src="/assets/images/claim/claim-card-right-arrow-icon.svg"
              alt=""
            />
          </p>
          <p className="flex">
            <p className="font-semibold mr-1">
              {stakingAddressFromPast
                ? totalRewardFromPast.dsp
                : totalRewards.dsp}
            </p>
            Power
          </p>
        </span>
        <span className="flex justify-between font-light mb-3">
          <p>bonALICE Tier:</p>
          <p className="font-semibold">
            {stakingAddressFromPast || eligibleAddresses.length > 0
              ? 'ALICE Starter'
              : 'No eligible wallet'}
          </p>
        </span>
        <p className="flex justify-between font-light">
          <p>Potential APR:</p>
          <p className="font-semibold">
            {stakingAddressFromPast || eligibleAddresses.length > 0
              ? '10%-15%'
              : 'No eligible wallet'}
          </p>
        </p>
      </div>
      <div className="claim-card__right flex flex-col items-end justify-between flex-[3]">
        {eligibleAddresses.length > 0 || rewardWalletsFromPast.length > 0 ? (
          <p
            onClick={() => setIsPrizeCalculationDetailModalOpen(true)}
            className="font-medium underline text-sm cursor-pointer"
          >
            Prize Calculation Details
          </p>
        ) : null}
        {chainId !== getCurrentChainId() ? (
          <button
            onClick={() => handleSwitchNetwork(getCurrentChainId())}
            className="btn text-xl font-medium !min-w-[180px] !px-6 mt-auto"
          >
            Switch Network
          </button>
        ) : isMetamaskLoading || isTransactionLoading ? (
          <button
            className="btn text-xl font-medium !min-w-[180px] !px-6 mt-auto"
            disabled
          >
            {isMetamaskLoading ? 'Metamask...' : 'Transaction...'}
          </button>
        ) : claimSignatureFromPast ? (
          <button
            onClick={() => handleClaimRewardsFromPastClicked()}
            className="btn text-xl font-medium !min-w-[180px] !px-6 mt-auto"
          >
            Claim
          </button>
        ) : (
          <button
            onClick={() => handleClaimRewardsClicked()}
            className="btn text-xl font-medium !min-w-[180px] !px-6 mt-auto"
            disabled={isClaimButtonDisabled}
          >
            Claim
          </button>
        )}
      </div>
      <Modal
        size="lg"
        closeModalHandler={() => setIsPrizeCalculationDetailModalOpen(false)}
        isOpen={isPrizeCalculationDetailModalOpen}
      >
        <PrizeCalculationDetailModal />
      </Modal>
      <Modal
        size="sm"
        isOpen={isConfirmModalOpen}
        closeModalHandler={() => setIsConfirmModalOpen(false)}
      >
        <div className="pb-2 px-2 flex flex-col justify-center items-center">
          <img
            className="w-[108px] mb-10"
            src="/assets/images/claim/switch-wallet-modal-icon.svg"
            alt=""
          />
          <p className="text-center mb-5">
            Be aware that if you press confirm button, you will be only able to
            claim your reward on the staking address{' '}
            <strong>({formatWalletAddress(stakingAddress)})</strong>.
          </p>
          <button
            className="btn btn--secondary"
            onClick={() => handleConfirmClaimClicked()}
          >
            Confirm
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ClaimCard;
