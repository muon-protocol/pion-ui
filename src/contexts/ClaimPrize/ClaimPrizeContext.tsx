import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';
import useUserProfile from '../UserProfile/useUserProfile.ts';
import {
  getClaimSignatureAPI,
  getRewardsAPI,
  getClaimSignatureFromPastAPI,
} from '../../apis';
import {
  AlreadyRegisteredWallet,
  RawRewards,
  RewardWallet,
  WalletWithSignature,
} from '../../types';
import { W3bNumber } from '../../types/wagmi.ts';
import { w3bNumberFromNumber } from '../../utils/web3.ts';
import useSignMessage from '../../hooks/useSignMessage.ts';
import useWagmiContractWrite from '../../hooks/useWagmiContractWrite.ts';
import REWARD_ABI from '../../abis/Reward.json';
import { getCurrentChainId } from '../../constants/chains.ts';
import { REWARD_ADDRESS } from '../../constants/addresses.ts';
import { useClaimRewardArgs } from '../../hooks/useContractArgs.ts';
import toast from 'react-hot-toast';
import { useRawRewardsFromPast } from '../../hooks/useRawRewardsFromPast.ts';
import useRawRewards from '../../hooks/useRawRewards.ts';

const ClaimPrizeContext = createContext<{
  isSwitchBackToWalletModalOpen: boolean;
  openSwitchBackToWalletModal: () => void;
  closeSwitchBackToWalletModal: () => void;
  totalRewards: W3bNumber;
  stakingAddress: `0x${string}` | null;
  handleVerifyWallet: () => void;
  isMetamaskLoadingVerify: boolean;
  eligibleAddresses: RewardWallet[];
  handleRemoveWallet: (walletAddress: string) => void;
  isMetamaskLoading: boolean;
  isTransactionLoading: boolean;
  isSuccess: boolean;
  alreadyClaimedPrize: boolean;
  setAlreadyClaimedPrize: (value: boolean) => void;
  claimSignature: string | null;
  rawRewards: RawRewards | null;
  rawRewardsFromPast: RawRewards | null;
  stakingAddressFromPast: `0x${string}` | null;
  walletsWithSignatureFromPast: WalletWithSignature[];
  claimSignatureFromPast: string | null;
  rewardWalletsFromPast: RewardWallet[];
  totalRewardFromPast: W3bNumber;
  handleClaimButtonClicked: () => void;
  handleClaimRewardsFromPastClicked: () => void;
  isConfirmModalOpen: boolean;
  handleClaimRewardsClicked: () => void;
  handleConfirmClaimClicked: () => void;
  setIsConfirmModalOpen: (value: boolean) => void;
  alreadyRegisteredWallet: AlreadyRegisteredWallet | null;
}>({
  isSwitchBackToWalletModalOpen: false,
  openSwitchBackToWalletModal: () => {},
  closeSwitchBackToWalletModal: () => {},
  totalRewards: w3bNumberFromNumber(0),
  stakingAddress: null,
  handleVerifyWallet: () => {},
  isMetamaskLoadingVerify: false,
  eligibleAddresses: [],
  handleRemoveWallet: () => {},
  isMetamaskLoading: false,
  isTransactionLoading: false,
  isSuccess: false,
  alreadyClaimedPrize: false,
  setAlreadyClaimedPrize: () => {},
  claimSignature: null,
  rawRewards: null,
  rawRewardsFromPast: null,
  stakingAddressFromPast: null,
  walletsWithSignatureFromPast: [],
  claimSignatureFromPast: null,
  rewardWalletsFromPast: [],
  totalRewardFromPast: w3bNumberFromNumber(0),
  handleClaimButtonClicked: () => {},
  handleClaimRewardsFromPastClicked: () => {},
  isConfirmModalOpen: false,
  handleClaimRewardsClicked: () => {},
  handleConfirmClaimClicked: () => {},
  setIsConfirmModalOpen: () => {},
  alreadyRegisteredWallet: null,
});

const ClaimPrizeProvider = ({ children }: { children: ReactNode }) => {
  const { walletAddress, isConnected } = useUserProfile();

  const [isSwitchBackToWalletModalOpen, setIsSwitchBackToWalletModalOpen] =
    useState(false);

  const [rawRewards, setRawRewards] = useState<RawRewards | null>(null);
  const [rawRewardsFromPast, setRawRewardsFromPast] =
    useState<RawRewards | null>(null);

  const [stakingAddress, setStakingAddress] = useState<`0x${string}` | null>(
    null,
  );

  const [walletsWithSignature, setWalletsWithSignature] = useState<
    WalletWithSignature[]
  >([]);

  const [claimSignature, setClaimSignature] = useState<string | null>(null);
  const [alreadyClaimedPrize, setAlreadyClaimedPrize] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isReadyToClaim, setIsReadyToClaim] = useState(false);

  const {
    stakingAddressFromPast,
    walletsWithSignatureFromPast,
    claimSignatureFromPast,
    rewardWalletsFromPast,
    totalRewardFromPast,
  } = useRawRewardsFromPast({ rawRewardsFromPast });

  const { totalRewards, eligibleAddresses, alreadyRegisteredWallet } =
    useRawRewards({
      rawRewards,
      walletsWithSignature,
    });

  const { signMessageMetamask } = useSignMessage({
    message: `Please sign this message to confirm that you would like to use "${stakingAddress}" as your reward claim destination.`,
  });

  const claimRewardArgs = useClaimRewardArgs({
    rewardAmount: totalRewards,
    signature: claimSignature,
    connectedWalletAddress: walletAddress,
    stakingAddress: stakingAddress,
  });

  const claimRewardFromPastArgs = useClaimRewardArgs({
    rewardAmount: totalRewardFromPast,
    signature: claimSignatureFromPast,
    connectedWalletAddress: walletAddress,
    stakingAddress: stakingAddressFromPast,
  });

  const {
    callback: claimReward,
    isMetamaskLoading,
    isTransactionLoading,
    isSuccess,
  } = useWagmiContractWrite({
    abi: REWARD_ABI,
    address: REWARD_ADDRESS[getCurrentChainId()],
    functionName: 'claimReward',
    args: claimRewardFromPastArgs || claimRewardArgs,
    chainId: getCurrentChainId(),
    showErrorToast: true,
  });

  useEffect(() => {
    if (isSuccess) {
      toast.success('Claimed successfully');
      setStakingAddress(null);
      setWalletsWithSignature([]);
      setClaimSignature(null);
      setRawRewards(null);
    }
  }, [isSuccess]);

  useEffect(() => {
    if (!walletAddress) return;
    if (
      alreadyRegisteredWallet &&
      !alreadyRegisteredWallet.isAlreadyRegistered &&
      !stakingAddress
    ) {
      setStakingAddress(walletAddress);
    }
  }, [alreadyRegisteredWallet, walletAddress, stakingAddress]);

  const newWalletConnected = useCallback(
    (walletAddress: `0x${string}`) => {
      if (!walletAddress || !isConnected) return;
      if (
        !walletsWithSignature.find(
          (wallet) => wallet.walletAddress === walletAddress,
        )
      ) {
        setWalletsWithSignature([
          ...walletsWithSignature,
          {
            walletAddress: walletAddress,
            signature: null,
          },
        ]);
      }
    },
    [walletsWithSignature, isConnected],
  );

  const getClaimSignatureFromPast = useCallback(async () => {
    if (!walletAddress) {
      setClaimSignature(null);
      setRawRewards(null);
      setRawRewardsFromPast(null);
      setStakingAddress(null);
      setWalletsWithSignature([]);
      return;
    }
    try {
      const result = await getClaimSignatureFromPastAPI(walletAddress);
      if (result?.success) {
        setRawRewardsFromPast(result.result);
      } else {
        setRawRewardsFromPast(null);
        newWalletConnected(walletAddress);
      }
    } catch (e) {
      console.log(e);
    }
  }, [walletAddress, newWalletConnected]);

  useEffect(() => {
    getClaimSignatureFromPast();
  }, [walletAddress, getClaimSignatureFromPast, claimSignature]);

  const handleClaimReward = useCallback(async () => {
    setIsConfirmModalOpen(false);
    try {
      await claimReward?.({
        pending: 'Waiting for confirmation',
        success: 'you have claimed your Bonded ALICE.',
        failed: 'Error',
      });
    } catch (e) {
      console.log(e);
    }
  }, [claimReward, setIsConfirmModalOpen]);

  useEffect(() => {
    if (isReadyToClaim && claimRewardArgs) {
      setIsReadyToClaim(false);
      handleClaimReward();
    }
  }, [isReadyToClaim, claimRewardArgs, handleClaimReward]);

  useEffect(() => {
    if (walletAddress === stakingAddress) {
      if (isSwitchBackToWalletModalOpen) {
        setIsSwitchBackToWalletModalOpen(false);
        setIsConfirmModalOpen(true);
      }
    }
    if (isConfirmModalOpen) {
      if (stakingAddress !== walletAddress) {
        setIsConfirmModalOpen(false);
        setIsSwitchBackToWalletModalOpen(true);
      }
    }
  }, [
    walletAddress,
    stakingAddress,
    isSwitchBackToWalletModalOpen,
    isConfirmModalOpen,
  ]);

  const handleClaimButtonClicked = useCallback(async () => {
    if (stakingAddressFromPast) {
      if (stakingAddressFromPast === walletAddress) {
        handleClaimReward();
        return;
      } else {
        setIsSwitchBackToWalletModalOpen(true);
        return;
      }
    }
    if (stakingAddress) {
      if (stakingAddress === walletAddress) {
        handleClaimReward();
        return;
      } else {
        setIsSwitchBackToWalletModalOpen(true);
        return;
      }
    }
  }, [
    stakingAddressFromPast,
    walletAddress,
    handleClaimReward,
    stakingAddress,
  ]);

  const handleRemoveWallet = (walletAddress: string) => {
    setWalletsWithSignature((wallets) =>
      wallets.filter((wallet) => wallet.walletAddress !== walletAddress),
    );
  };

  const [isMetamaskLoadingVerify, setIsMetamaskLoadingVerify] = useState(false);

  const handleVerifyWallet = () => {
    setIsMetamaskLoadingVerify(true);
    signMessageMetamask()
      .then((signature) => {
        setIsMetamaskLoadingVerify(false);
        setWalletsWithSignature((wallets) => {
          const newWallets = [...wallets];
          const index = newWallets.findIndex(
            (wallet) => wallet.walletAddress === walletAddress,
          );
          newWallets[index].signature = signature;
          return newWallets;
        });
      })
      .catch((error) => {
        setIsMetamaskLoadingVerify(false);
        console.log(error);
      });
  };

  useEffect(() => {
    if (!walletAddress || !isConnected || claimSignature) return;

    async function getRewards() {
      try {
        const walletsString: string[] = [];
        walletsWithSignature.map((wallet) => {
          walletsString.push(wallet.walletAddress);
        });
        if (walletsString.length === 0) return;
        if (!claimSignature) {
          const response = await getRewardsAPI(walletsString);
          if (response.success && !claimSignature)
            setRawRewards(response.result);
        }
      } catch (error) {
        console.log(error);
      }
    }

    getRewards();
  }, [walletsWithSignature, walletAddress, isConnected, claimSignature]);

  const handleConfirmClaimClicked = useCallback(async () => {
    if (eligibleAddresses.find((wallet) => wallet.signature === null)) return;

    const signatures = eligibleAddresses.map((wallet) => wallet.signature);
    const addresses = eligibleAddresses.map((wallet) => wallet.walletAddress);
    if (
      !stakingAddress ||
      !isConnected ||
      signatures.some((sig) => !sig) ||
      !addresses
    )
      return;
    try {
      const response = await getClaimSignatureAPI(
        signatures,
        addresses,
        stakingAddress,
      );
      if (response?.success) {
        setClaimSignature(response.result.signature);
        setIsReadyToClaim(true);
        setTimeout(() => {
          setWalletsWithSignature([]);
          setStakingAddress(null);
        }, 1000);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.log(error);
    }
  }, [
    stakingAddress,
    eligibleAddresses,
    isConnected,
    setClaimSignature,
    setIsReadyToClaim,
  ]);

  const handleClaimRewardsClicked = useCallback(async () => {
    if (!stakingAddress || stakingAddressFromPast) return;
    if (stakingAddress !== walletAddress) {
      setIsSwitchBackToWalletModalOpen(true);
      return;
    }
    setIsConfirmModalOpen(true);
  }, [stakingAddress, walletAddress, stakingAddressFromPast]);

  const handleClaimRewardsFromPastClicked = useCallback(async () => {
    if (!stakingAddressFromPast) return;
    handleClaimReward();
  }, [stakingAddressFromPast, handleClaimReward]);

  const openSwitchBackToWalletModal = () =>
    setIsSwitchBackToWalletModalOpen(true);
  const closeSwitchBackToWalletModal = () =>
    setIsSwitchBackToWalletModalOpen(false);

  return (
    <ClaimPrizeContext.Provider
      value={{
        isSwitchBackToWalletModalOpen,
        openSwitchBackToWalletModal,
        closeSwitchBackToWalletModal,
        totalRewards,
        stakingAddress,
        handleVerifyWallet,
        isMetamaskLoadingVerify,
        eligibleAddresses,
        handleRemoveWallet,
        isMetamaskLoading,
        isTransactionLoading,
        isSuccess,
        alreadyClaimedPrize,
        setAlreadyClaimedPrize,
        claimSignature,
        rawRewards,
        rawRewardsFromPast,
        claimSignatureFromPast,
        rewardWalletsFromPast,
        totalRewardFromPast,
        walletsWithSignatureFromPast,
        stakingAddressFromPast,
        handleClaimButtonClicked,
        handleClaimRewardsFromPastClicked,
        handleClaimRewardsClicked,
        isConfirmModalOpen,
        handleConfirmClaimClicked,
        setIsConfirmModalOpen,
        alreadyRegisteredWallet,
      }}
    >
      {children}
    </ClaimPrizeContext.Provider>
  );
};

export { ClaimPrizeProvider, ClaimPrizeContext };
