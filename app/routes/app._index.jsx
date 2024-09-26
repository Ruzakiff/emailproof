import React from 'react';
import { ImageProof } from "../components/imageproof";
import { Page, DropZone, LegacyStack, Thumbnail, Text, Button, Select } from "@shopify/polaris";

class ErrorBoundary extends React.Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error) {
		return { hasError: true };
	}

	componentDidCatch(error, errorInfo) {
		console.log('Error:', error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			return <h1>Something went wrong.</h1>;
		}

		return this.props.children; 
	}
}

export default function Index() {
	return (
		<ErrorBoundary>
			<ImageProof 
				Page={Page}
				DropZone={DropZone}
				LegacyStack={LegacyStack}
				Thumbnail={Thumbnail}
				Text={Text}
				Button={Button}
				Select={Select}
			/>
		</ErrorBoundary>
	);
}


