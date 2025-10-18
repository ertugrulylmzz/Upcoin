// Farcaster Mini App: Base Mainnet NFT Mint Uygulaması
// Teknolojiler: React + Tailwind + ethers.js + Farcaster Mini App SDK

import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';

// Placeholder MiniSDK (replace with actual Farcaster Mini App SDK imports)
const MiniSDK = {
  getCurrentUser: async () => ({ user: { fid: '0x1234', displayName: 'Satoshi' }, isSignedIn: true }),
  getEthereumProvider: async () => window.ethereum,
  shareCast: async (message) => console.log('Cast shared:', message),
};

export default function FarcasterNFTApp() {
  const [user, setUser] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [ipfsURL, setIpfsURL] = useState('');
  const [minting, setMinting] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [log, setLog] = useState([]);

  useEffect(() => {
    (async () => {
      const { user: u, isSignedIn } = await MiniSDK.getCurrentUser();
      if (isSignedIn) setUser(u);
    })();
  }, []);

  // Basit IPFS upload placeholder (replace with NFT.Storage or Pinata SDK)
  const uploadToIPFS = async (file) => {
    // In a real app, upload file to IPFS & return CID
    const fakeCID = 'QmFakeIPFSHash';
    setIpfsURL(`ipfs://${fakeCID}`);
    setLog(l => [...l, `File uploaded to IPFS: ${fakeCID}`]);
    return `ipfs://${fakeCID}`;
  };

  const handleMint = async () => {
    if (!imageFile) {
      alert('Please select an image');
      return;
    }
    setMinting(true);
    try {
      const metadataURI = await uploadToIPFS(imageFile);
      const provider = new ethers.providers.Web3Provider(await MiniSDK.getEthereumProvider());
      const signer = provider.getSigner();

      const contractAddress = '0x03c4738ee98ae44591e1a4a4f3cab6641d95dd9a'; // Base mainnet ERC721
      const abi = [
        'function safeMint(address to, string memory uri) public returns (uint256)',
      ];
      const nftContract = new ethers.Contract(contractAddress, abi, signer);

      setLog(l => [...l, 'Sending mint transaction...']);
      const tx = await nftContract.safeMint(await signer.getAddress(), metadataURI);
      const receipt = await tx.wait();
      setTxHash(receipt.transactionHash);
      setLog(l => [...l, `Minted NFT! Tx: ${receipt.transactionHash}`]);

      // Farcaster Cast
      await MiniSDK.shareCast(`I just minted an NFT on Base! 🎨 Tx: ${receipt.transactionHash}`);
      setLog(l => [...l, 'Shared cast on Farcaster']);
    } catch (e) {
      setLog(l => [...l, 'Mint failed: ' + e.message]);
    } finally {
      setMinting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <header className="max-w-3xl mx-auto mb-6">
        <h1 className="text-2xl font-semibold">Farcaster Base NFT Mint</h1>
        <div className="text-sm text-slate-600">{user ? `Signed in as ${user.displayName}` : 'Not signed in'}</div>
      </header>

      <main className="max-w-3xl mx-auto space-y-6 bg-white rounded-2xl p-4 shadow-sm">
        <section>
          <h2 className="text-lg font-medium mb-2">Select Image to Mint</h2>
          <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
          {imageFile && <div className="mt-2">Selected: {imageFile.name}</div>}
        </section>

        <section>
          <button onClick={handleMint} disabled={minting} className="px-4 py-2 rounded-2xl border">
            {minting ? 'Minting...' : 'Mint NFT on Base'}
          </button>
        </section>

        {txHash && (
          <section>
            <h2 className="text-lg font-medium">Transaction Completed</h2>
            <a href={`https://basescan.org/tx/${txHash}`} target="_blank" rel="noreferrer" className="text-blue-600 underline">
              View on BaseScan
            </a>
          </section>
        )}

        <section>
          <h2 className="text-lg font-medium mb-2">Activity Log</h2>
          <div className="text-xs text-slate-500 max-h-40 overflow-y-auto">
            <ul className="space-y-1">
              {log.slice().reverse().map((l, i) => (<li key={i}>• {l}</li>))}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
