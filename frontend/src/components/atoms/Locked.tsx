import Icon from "@/components/atoms/Icon";

interface LockedProps {
  text: string;
}

export default function Locked({ text }: LockedProps) {
  return (
    <p className="items-start rounded-[1.2rem] flex text-[1.4rem] gap-10 leading-[1.45] py-12 px-14 bg-gray text-white d-locked">
      <Icon name="lock" />
      {text}
    </p>
  );
}
