import { authenticate } from "../shopify.server";
import { ImageProof } from "../components/imageproof";
import { Page, DropZone, LegacyStack, Thumbnail, Text } from '@shopify/polaris';

export const loader = async ({ request }) => {
	await authenticate.admin(request);
	return null;
};

export default function Index() {
	return (
		<ImageProof
			Page={Page}
			DropZone={DropZone}
			LegacyStack={LegacyStack}
			Thumbnail={Thumbnail}
			Text={Text}
		/>
	);
}


