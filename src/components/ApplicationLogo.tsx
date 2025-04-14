import Image from "next/image";

export const ApplicationLogo = () => {
  return (
    <Image
      src="/assets/img/application-logo.png"
      className=""
      alt="Logo"
      width={50}
      height={50}
    />
  );
};
