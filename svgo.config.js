const svgoConf = {
	plugins: [
		{ removeDoctype: true },
		{ removeXMLProcInst: true },
		{ removeEditorsNSData: true },
		{ removeMetadata: true },
		{ removeComments: true },
		{ removeDesc: true },
		{ removeTitle: true },
		{ removeUselessDefs: true },
		{ removeEmptyAttrs: true },
	],
};


export default svgoConf;
