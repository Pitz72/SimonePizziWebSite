import React from 'react';


interface SEOProps {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: string;
}

const SEO: React.FC<SEOProps> = ({
    title,
    description = "Portfolio creativo di Simone Pizzi. Narrativa interattiva, sviluppo software, AI e mondi virtuali.",
    image = "/images/og-image.jpg", // Assicurati di avere un'immagine di default
    url = "https://simonepizzi.runtimeradio.it",
    type = "website"
}) => {
    const siteTitle = "Simone Pizzi | Portfolio Creativo";
    const fullTitle = title ? `${title} | Simone Pizzi` : siteTitle;

    return (
<head>

            {/* Standard Metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={url} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:url" content={url} />
            <meta property="og:site_name" content={siteTitle} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

    </head>
);
};

export default SEO;
