import { db, StoredAssetRecord } from '../db/database';

export async function storeAsset(file: File): Promise<string> {
  const assetId = `asset_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const record: StoredAssetRecord = {
    id: assetId,
    fileName: file.name,
    fileType: file.type,
    data: file,
    size: file.size,
    createdAt: new Date().toISOString(),
  };

  await db.assets.put(record);
  return assetId;
}

export async function getAssetBlob(assetId: string): Promise<Blob | null> {
  const asset = await db.assets.get(assetId);
  return asset ? asset.data : null;
}

export async function getAssetUrl(assetId: string): Promise<string | null> {
  const blob = await getAssetBlob(assetId);
  if (!blob) return null;
  return URL.createObjectURL(blob);
}

export async function deleteAsset(assetId: string): Promise<void> {
  await db.assets.delete(assetId);
}
