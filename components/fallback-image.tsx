import { useEffect, useState } from "react";
import {
  Image,
  ImageBackground,
  ImageBackgroundProps,
  ImageProps,
  ImageSourcePropType,
} from "react-native";

type FallbackImageProps = Omit<ImageProps, "source"> & {
  source?: ImageSourcePropType;
  fallbackSource: ImageSourcePropType;
};

type FallbackImageBackgroundProps = Omit<ImageBackgroundProps, "source"> & {
  source?: ImageSourcePropType;
  fallbackSource: ImageSourcePropType;
};

export function FallbackImage({ source, fallbackSource, onError, ...props }: FallbackImageProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [source]);

  return (
    <Image
      {...props}
      source={!hasError && source ? source : fallbackSource}
      onError={(event) => {
        setHasError(true);
        onError?.(event);
      }}
    />
  );
}

export function FallbackImageBackground({
  source,
  fallbackSource,
  onError,
  ...props
}: FallbackImageBackgroundProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [source]);

  return (
    <ImageBackground
      {...props}
      source={!hasError && source ? source : fallbackSource}
      onError={(event) => {
        setHasError(true);
        onError?.(event);
      }}
    />
  );
}
