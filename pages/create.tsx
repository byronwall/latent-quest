import { Title } from "@mantine/core";
import { SdNewImagePrompt } from "../components/SdNewImagePrompt";

export default function CreatePrompt() {
  return (
    <div className="container">
      <Title order={1}>test a prompt</Title>
      <SdNewImagePrompt />
    </div>
  );
}
