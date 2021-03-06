import { Button, TextField, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useConnectWallet } from "@web3-onboard/react";
import { ethers } from "ethers";
import { useMemo, useState } from "react";
import abi from "../ButtonCreateERC721/abi.json";
import PendingTxModal from "../PendingTxModal";
import ConfirmedTxModal from "../ConfirmedTxModal";
import etherscanService from "../../utils/etherscanService";

const MintNFT = ({ contractAddress }) => {
  const [{ wallet }] = useConnectWallet();
  const [recipient, setRecipient] = useState(wallet?.accounts?.[0]?.address);
  const [tokenURI, setTokenURI] = useState(
    "ipfs://QmZMaWmwKCgmQLm6WUm7HXt9QNXgSzDKN7quFwnf4nv5QV"
  );
  const [tokenId, setTokenId] = useState();
  const [pendingTx, setPendingTx] = useState();

  const provider = new ethers.providers.Web3Provider(wallet?.provider);
  const signer = provider.getSigner();
  const contract = useMemo(
    () =>
      contractAddress
        ? new ethers.Contract(contractAddress, abi, signer)
        : false,
    [contractAddress]
  );

  const contractBlockscanAddress = useMemo(
    () => etherscanService.getAddressLink(wallet.chains[0].id, contractAddress),
    [contractAddress]
  );
  const ownerBlockscanAddress = useMemo(
    () =>
      etherscanService.getAddressLink(
        wallet.chains[0].id,
        wallet?.accounts?.[0]?.address
      ),
    [wallet]
  );

  const handleReceipt = (receipt) => {
    const newTokenId = receipt.events[0].args.tokenId.toString();
    setTokenId(newTokenId);
    setPendingTx(false);
  };

  const mint = async () => {
    setPendingTx("Sign transaction to Mint your NFT.");
    const tx = await contract.mint(recipient, tokenURI);
    setPendingTx("Minting NFT");
    const receipt = await tx.wait();
    handleReceipt(receipt);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Typography variant="h2" align="center">
        Created!
      </Typography>
      <h3>
        ERC721 contract (owned by{" "}
        <a target="__blank" href={ownerBlockscanAddress}>
          you
        </a>
        ):{" "}
        <a target="__blank" href={contractBlockscanAddress}>
          {contractAddress}
        </a>
      </h3>
      <h1>Mint an NFT on your smart contract</h1>
      <Box>
        <TextField
          label="NFT recipient"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
        />
        <TextField
          label="tokenURI"
          value={tokenURI}
          onChange={(e) => setTokenURI(e.target.value)}
        />
      </Box>

      <Button onClick={mint}>Mint NFT</Button>

      <ConfirmedTxModal tokenId={tokenId} contractAddress={contractAddress} />
      <PendingTxModal pendingTx={pendingTx} />
    </Box>
  );
};

export default MintNFT;
