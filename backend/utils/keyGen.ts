import sodium from 'libsodium-wrappers';

async function generateKeyPair() {
    await sodium.ready;
    const keyPair = sodium.crypto_box_keypair();
    return {
      publicKey: sodium.to_base64(keyPair.publicKey),
      privateKey: sodium.to_base64(keyPair.privateKey),
    };
  }