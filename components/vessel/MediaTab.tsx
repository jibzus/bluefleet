"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MediaTabProps {
  data: any[];
  onChange: (media: any[]) => void;
}

export function MediaTab({ data, onChange }: MediaTabProps) {
  const [media, setMedia] = useState(data || []);
  const [newImageUrl, setNewImageUrl] = useState("");

  const handleAddImage = () => {
    if (!newImageUrl.trim()) {
      alert("Please enter an image URL");
      return;
    }

    const newMedia = [
      ...media,
      {
        url: newImageUrl,
        alt: "",
        sort: media.length,
      },
    ];

    setMedia(newMedia);
    onChange(newMedia);
    setNewImageUrl("");
  };

  const handleRemoveImage = (index: number) => {
    const newMedia = media.filter((_, i) => i !== index);
    setMedia(newMedia);
    onChange(newMedia);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newMedia = [...media];
    [newMedia[index - 1], newMedia[index]] = [newMedia[index], newMedia[index - 1]];
    newMedia.forEach((item, i) => (item.sort = i));
    setMedia(newMedia);
    onChange(newMedia);
  };

  const handleMoveDown = (index: number) => {
    if (index === media.length - 1) return;
    const newMedia = [...media];
    [newMedia[index], newMedia[index + 1]] = [newMedia[index + 1], newMedia[index]];
    newMedia.forEach((item, i) => (item.sort = i));
    setMedia(newMedia);
    onChange(newMedia);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 text-xl font-semibold">Vessel Images</h2>
        <p className="mb-4 text-sm text-gray-600">
          Add at least one image of your vessel. The first image will be used as the thumbnail.
        </p>

        {/* Add Image */}
        <div className="mb-6 rounded-lg border border-dashed border-gray-300 p-6">
          <h3 className="mb-3 font-medium">Add Image URL</h3>
          <p className="mb-3 text-sm text-gray-600">
            For now, please provide image URLs. File upload will be available soon.
          </p>
          <div className="flex gap-2">
            <Input
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="https://example.com/vessel-image.jpg"
              className="flex-1"
            />
            <Button onClick={handleAddImage}>Add Image</Button>
          </div>
        </div>

        {/* Image Gallery */}
        {media.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
            <div className="mb-2 text-4xl">📸</div>
            <p className="text-gray-600">No images added yet</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {media.map((item, index) => (
              <div key={index} className="rounded-lg border p-4">
                <div className="relative mb-3 h-48 overflow-hidden rounded-lg bg-gray-200">
                  <img
                    src={item.url}
                    alt={item.alt || `Vessel image ${index + 1}`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder-vessel.jpg";
                    }}
                  />
                  {index === 0 && (
                    <div className="absolute left-2 top-2 rounded bg-primary px-2 py-1 text-xs font-medium text-white">
                      Thumbnail
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="flex-1 text-xs"
                  >
                    ↑
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === media.length - 1}
                    className="flex-1 text-xs"
                  >
                    ↓
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleRemoveImage(index)}
                    className="flex-1 text-xs"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sample Images */}
      <div className="rounded-lg bg-blue-50 p-4">
        <h3 className="mb-2 font-medium text-blue-900">Sample Image URLs (for testing)</h3>
        <p className="mb-3 text-sm text-blue-800">
          Click to copy these sample URLs for testing:
        </p>
        <div className="space-y-2">
          {[
            "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=800",
            "https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=800",
            "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
          ].map((url, i) => (
            <button
              key={i}
              onClick={() => setNewImageUrl(url)}
              className="block w-full rounded bg-white px-3 py-2 text-left text-sm hover:bg-blue-100"
            >
              Sample Image {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

