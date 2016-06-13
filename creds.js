var credentials = {}

// If we're running locally, manually populate our credentials
if (!process.env.VCAP_SERVICES) {
	credentials =
	{
		"peers": [
			{
				"discovery_host": "1f3975cd-2a47-4355-b3f0-10324f7781fa_vp1-discovery.blockchain.ibm.com",
				"discovery_port": 30303,
				"api_host": "1f3975cd-2a47-4355-b3f0-10324f7781fa_vp1-api.blockchain.ibm.com",
				"api_port_tls": 443,
				"api_port": 80,
				"type": "peer",
				"network_id": "1f3975cd-2a47-4355-b3f0-10324f7781fa",
				"container_id": "d5a28583c46f974a3229c9c26a6db731ccd1c7f6aee3a43a4cd1058375b0481f",
				"id": "1f3975cd-2a47-4355-b3f0-10324f7781fa_vp1",
				"api_url": "http://1f3975cd-2a47-4355-b3f0-10324f7781fa_vp1-api.blockchain.ibm.com:80"
			},
			{
				"discovery_host": "1f3975cd-2a47-4355-b3f0-10324f7781fa_vp2-discovery.blockchain.ibm.com",
				"discovery_port": 30303,
				"api_host": "1f3975cd-2a47-4355-b3f0-10324f7781fa_vp2-api.blockchain.ibm.com",
				"api_port_tls": 443,
				"api_port": 80,
				"type": "peer",
				"network_id": "1f3975cd-2a47-4355-b3f0-10324f7781fa",
				"container_id": "12915efd4a54df3eec8cf092ac59741597542561b713d078d7484fc745560603",
				"id": "1f3975cd-2a47-4355-b3f0-10324f7781fa_vp2",
				"api_url": "http://1f3975cd-2a47-4355-b3f0-10324f7781fa_vp2-api.blockchain.ibm.com:80"
			}
		],
		"ca": {
			"1f3975cd-2a47-4355-b3f0-10324f7781fa_ca": {
				"url": "1f3975cd-2a47-4355-b3f0-10324f7781fa_ca-api.blockchain.ibm.com:30303",
				"discovery_host": "1f3975cd-2a47-4355-b3f0-10324f7781fa_ca-discovery.blockchain.ibm.com",
				"discovery_port": 30303,
				"api_host": "1f3975cd-2a47-4355-b3f0-10324f7781fa_ca-api.blockchain.ibm.com",
				"api_port_tls": 30303,
				"api_port": 80,
				"type": "ca",
				"network_id": "1f3975cd-2a47-4355-b3f0-10324f7781fa",
				"container_id": "b5a1caacd42c7b22df2c7c709fc137183c767df263aba969f76ae5d542c1c651"
			}
		},
		"users": [
			{
				"username": "dashboarduser_type0_225ec09f06",
				"secret": "8209f8b785",
				"enrollId": "dashboarduser_type0_225ec09f06",
				"enrollSecret": "8209f8b785"
			},
			{
				"username": "dashboarduser_type0_5700041834",
				"secret": "b915a52a9f",
				"enrollId": "dashboarduser_type0_5700041834",
				"enrollSecret": "b915a52a9f"
			},
			{
				"username": "user_type1_376204471b",
				"secret": "bf912166ab",
				"enrollId": "user_type1_376204471b",
				"enrollSecret": "bf912166ab"
			},
			{
				"username": "user_type1_4cdd0307ba",
				"secret": "d52a30c38c",
				"enrollId": "user_type1_4cdd0307ba",
				"enrollSecret": "d52a30c38c"
			},
			{
				"username": "user_type1_ecb4bac3cd",
				"secret": "7004f8adcf",
				"enrollId": "user_type1_ecb4bac3cd",
				"enrollSecret": "7004f8adcf"
			},
			{
				"username": "user_type1_36b3b913b1",
				"secret": "a8c7907c75",
				"enrollId": "user_type1_36b3b913b1",
				"enrollSecret": "a8c7907c75"
			},
			{
				"username": "user_type1_dea5d0c25b",
				"secret": "b5ddfa58f0",
				"enrollId": "user_type1_dea5d0c25b",
				"enrollSecret": "b5ddfa58f0"
			},
			{
				"username": "user_type2_591dda1b1c",
				"secret": "d00da9f182",
				"enrollId": "user_type2_591dda1b1c",
				"enrollSecret": "d00da9f182"
			},
			{
				"username": "user_type2_5cdb897f62",
				"secret": "e686773887",
				"enrollId": "user_type2_5cdb897f62",
				"enrollSecret": "e686773887"
			},
			{
				"username": "user_type2_d96588be6a",
				"secret": "d4cacf1249",
				"enrollId": "user_type2_d96588be6a",
				"enrollSecret": "d4cacf1249"
			},
			{
				"username": "user_type2_29113fe7cf",
				"secret": "883a54770b",
				"enrollId": "user_type2_29113fe7cf",
				"enrollSecret": "883a54770b"
			},
			{
				"username": "user_type2_de7087688e",
				"secret": "413438cd0d",
				"enrollId": "user_type2_de7087688e",
				"enrollSecret": "413438cd0d"
			},
			{
				"username": "user_type4_ff36855410",
				"secret": "64d5bbcdfa",
				"enrollId": "user_type4_ff36855410",
				"enrollSecret": "64d5bbcdfa"
			},
			{
				"username": "user_type4_72c5fa5bbb",
				"secret": "e49889eee8",
				"enrollId": "user_type4_72c5fa5bbb",
				"enrollSecret": "e49889eee8"
			},
			{
				"username": "user_type4_7b87d4bb4b",
				"secret": "a0c40fcc95",
				"enrollId": "user_type4_7b87d4bb4b",
				"enrollSecret": "a0c40fcc95"
			},
			{
				"username": "user_type4_9200f8f57c",
				"secret": "d4c9925a88",
				"enrollId": "user_type4_9200f8f57c",
				"enrollSecret": "d4c9925a88"
			},
			{
				"username": "user_type4_8876612173",
				"secret": "633acc6ed7",
				"enrollId": "user_type4_8876612173",
				"enrollSecret": "633acc6ed7"
			},
			{
				"username": "user_type8_f8901dfdb8",
				"secret": "8b193c94d3",
				"enrollId": "user_type8_f8901dfdb8",
				"enrollSecret": "8b193c94d3"
			},
			{
				"username": "user_type8_c76a12fab4",
				"secret": "d3707fd349",
				"enrollId": "user_type8_c76a12fab4",
				"enrollSecret": "d3707fd349"
			},
			{
				"username": "user_type8_296ced6b1e",
				"secret": "0d9bb37fa9",
				"enrollId": "user_type8_296ced6b1e",
				"enrollSecret": "0d9bb37fa9"
			},
			{
				"username": "user_type8_2deea9bc3a",
				"secret": "7343c49f6e",
				"enrollId": "user_type8_2deea9bc3a",
				"enrollSecret": "7343c49f6e"
			},
			{
				"username": "user_type8_a1542587aa",
				"secret": "8def3b2a5d",
				"enrollId": "user_type8_a1542587aa",
				"enrollSecret": "8def3b2a5d"
			}
		]
	}
}
// Otherwise, get them from Bluemix
else {
	creds = process.env.VCAP_SERVICES.credentials;
}

exports.credentials = credentials;