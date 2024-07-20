const timeZoneMap = {};

export const timeZones = [
  {
    countryCode: 'AF',
    name: 'Asia/Kabul',
    utcOffset: '+04:30',
  },
  {
    countryCode: 'AL',
    name: 'Europe/Tirane',
    utcOffset: '+01:00',
  },
  {
    countryCode: 'DZ',
    name: 'Africa/Algiers',
    utcOffset: '+01:00',
  },
  {
    countryCode: 'AS',
    name: 'Pacific/Pago_Pago',
    utcOffset: '-11:00',
  },
  {
    countryCode: 'AD',
    name: 'Europe/Andorra',
    utcOffset: '+01:00',
  },
  {
    countryCode: 'AO',
    name: 'Africa/Luanda',
    utcOffset: '+01:00',
  },
  {
    countryCode: 'AI',
    name: 'America/Anguilla',
    utcOffset: '-04:00',
  },
  {
    countryCode: 'AQ',
    name: 'Antarctica/Casey',
    utcOffset: '+08:00',
  },
  {
    countryCode: 'AQ',
    name: 'Antarctica/Davis',
    utcOffset: '+07:00',
  },
  {
    countryCode: 'AQ',
    name: 'Antarctica/DumontDUrville',
    utcOffset: '+10:00',
  },
  {
    countryCode: 'AQ',
    name: 'Antarctica/Mawson',
    utcOffset: '+05:00',
  },
  {
    countryCode: 'AQ',
    name: 'Antarctica/McMurdo',
    utcOffset: '+13:00',
  },
  {
    countryCode: 'AQ',
    name: 'Antarctica/Palmer',
    utcOffset: '-03:00',
  },
  {
    countryCode: 'AQ',
    name: 'Antarctica/Rothera',
    utcOffset: '-03:00',
  },
  {
    countryCode: 'AQ',
    name: 'Antarctica/Syowa',
    utcOffset: '+03:00',
  },
  {
    countryCode: 'AQ',
    name: 'Antarctica/Troll',
    utcOffset: '+00:00',
  },
  {
    countryCode: 'AQ',
    name: 'Antarctica/Vostok',
    utcOffset: '+05:00',
  },
  {
    countryCode: 'AG',
    name: 'America/Antigua',
    utcOffset: '-04:00',
  },
  {
    countryCode: 'AR',
    name: 'America/Argentina/Buenos_Aires',
    utcOffset: '-03:00',
  },
  {
    countryCode: 'AR',
    name: 'America/Argentina/Catamarca',
    utcOffset: '-03:00',
  },
  {
    countryCode: 'AR',
    name: 'America/Argentina/Cordoba',
    utcOffset: '-03:00',
  },
  {
    countryCode: 'AR',
    name: 'America/Argentina/Jujuy',
    utcOffset: '-03:00',
  },
  {
    countryCode: 'AR',
    name: 'America/Argentina/La_Rioja',
    utcOffset: '-03:00',
  },
  {
    countryCode: 'AR',
    name: 'America/Argentina/Mendoza',
    utcOffset: '-03:00',
  },
  {
    countryCode: 'AR',
    name: 'America/Argentina/Rio_Gallegos',
    utcOffset: '-03:00',
  },
  {
    countryCode: 'AR',
    name: 'America/Argentina/Salta',
    utcOffset: '-03:00',
  },
  {
    countryCode: 'AR',
    name: 'America/Argentina/San_Juan',
    utcOffset: '-03:00',
  },
  {
    countryCode: 'AR',
    name: 'America/Argentina/San_Luis',
    utcOffset: '-03:00',
  },
  {
    countryCode: 'AR',
    name: 'America/Argentina/Tucuman',
    utcOffset: '-03:00',
  },
  {
    countryCode: 'AR',
    name: 'America/Argentina/Ushuaia',
    utcOffset: '-03:00',
  },
  {
    countryCode: 'AM',
    name: 'Asia/Yerevan',
    utcOffset: '+04:00',
  },
  {
    countryCode: 'AW',
    name: 'America/Aruba',
    utcOffset: '-04:00',
  },
  {
    countryCode: 'AU',
    name: 'Antarctica/Macquarie',
    utcOffset: '+11:00',
  },
  {
    countryCode: 'AU',
    name: 'Australia/Adelaide',
    utcOffset: '+10:30',
  },
  {
    countryCode: 'AU',
    name: 'Australia/Brisbane',
    utcOffset: '+10:00',
  },
  {
    countryCode: 'AU',
    name: 'Australia/Broken_Hill',
    utcOffset: '+10:30',
  },
  {
    countryCode: 'AU',
    name: 'Australia/Darwin',
    utcOffset: '+09:30',
  },
  {
    countryCode: 'AU',
    name: 'Australia/Eucla',
    utcOffset: '+08:45',
  },
  {
    countryCode: 'AU',
    name: 'Australia/Hobart',
    utcOffset: '+11:00',
  },
  {
    countryCode: 'AU',
    name: 'Australia/Lindeman',
    utcOffset: '+10:00',
  },
  {
    countryCode: 'AU',
    name: 'Australia/Lord_Howe',
    utcOffset: '+11:00',
  },
  {
    countryCode: 'AU',
    name: 'Australia/Melbourne',
    utcOffset: '+11:00',
  },
  {
    countryCode: 'AU',
    name: 'Australia/Perth',
    utcOffset: '+08:00',
  },
  {
    countryCode: 'AU',
    name: 'Australia/Sydney',
    utcOffset: '+11:00',
  },
  {
    countryCode: 'AT',
    name: 'Europe/Vienna',
    utcOffset: '+01:00',
  },
  {
    countryCode: 'AZ',
    name: 'Asia/Baku',
    utcOffset: '+04:00',
  },
  {
    countryCode: 'BS',
    name: 'America/Nassau',
    utcOffset: '-05:00',
  },
  {
    countryCode: 'BH',
    name: 'Asia/Bahrain',
    utcOffset: '+03:00',
  },
  {
    countryCode: 'BD',
    name: 'Asia/Dhaka',
    utcOffset: '+06:00',
  },
  {
    countryCode: 'BB',
    name: 'America/Barbados',
    utcOffset: '-04:00',
  },
  {
    countryCode: 'BY',
    name: 'Europe/Minsk',
    utcOffset: '+03:00',
  },
  {
    countryCode: 'BE',
    name: 'Europe/Brussels',
    utcOffset: '+01:00',
  },
  {
    countryCode: 'BZ',
    name: 'America/Belize',
    utcOffset: '-06:00',
  },
  {
    countryCode: 'BJ',
    name: 'Africa/Porto-Novo',
    utcOffset: '+01:00',
  },
  {
    countryCode: 'BM',
    name: 'Atlantic/Bermuda',
    utcOffset: '-04:00',
  },
  {
    countryCode: 'BT',
    name: 'Asia/Thimphu',
    utcOffset: '+06:00',
  },
  {
    countryCode: 'BO',
    name: 'America/La_Paz',
    utcOffset: '-04:00',
  },
  {
    countryCode: 'BQ',
    name: 'America/Kralendijk',
    utcOffset: '-04:00',
  },
  {
    countryCode: 'BA',
    name: 'Europe/Sarajevo',
    utcOffset: '+01:00',
  },
  {
    countryCode: 'BW',
    name: 'Africa/Gaborone',
    utcOffset: '+02:00',
  },
  {
    countryCode: 'BR',
    name: 'America/Araguaina',
    utcOffset: '-03:00',
  },
  {
    countryCode: 'BR',
    name: 'America/Bahia',
    utcOffset: '-03:00',
  },
  {
    countryCode: 'BR',
    name: 'America/Belem',
    utcOffset: '-03:00',
  },
  {
    countryCode: 'BR',
    name: 'America/Boa_Vista',
    utcOffset: '-04:00',
  },
  {
    countryCode: 'BR',
    name: 'America/Campo_Grande',
    utcOffset: '-04:00',
  },
  {
    countryCode: 'BR',
    name: 'America/Cuiaba',
    utcOffset: '-04:00',
  },
  {
    countryCode: 'BR',
    name: 'America/Eirunepe',
    utcOffset: '-05:00',
  },
  {
    countryCode: 'BR',
    name: 'America/Fortaleza',
    utcOffset: '-03:00',
  },
  {
    countryCode: 'BR',
    name: 'America/Maceio',
    utcOffset: '-03:00',
  },
  {
    countryCode: 'BR',
    name: 'America/Manaus',
    utcOffset: '-04:00',
  },
  {
    countryCode: 'BR',
    name: 'America/Noronha',
    utcOffset: '-02:00',
  },
  {
    countryCode: 'BR',
    name: 'America/Porto_Velho',
    utcOffset: '-04:00',
  },
  {
    countryCode: 'BR',
    name: 'America/Recife',
    utcOffset: '-03:00',
  },
  {
    countryCode: 'BR',
    name: 'America/Rio_Branco',
    utcOffset: '-05:00',
  },
  {
    countryCode: 'BR',
    name: 'America/Santarem',
    utcOffset: '-03:00',
  },
  {
    countryCode: 'BR',
    name: 'America/Sao_Paulo',
    utcOffset: '-03:00',
  },
  {
    countryCode: 'IO',
    name: 'Indian/Chagos',
    utcOffset: '+06:00',
  },
  {
    countryCode: 'BN',
    name: 'Asia/Brunei',
    utcOffset: '+08:00',
  },
  {
    countryCode: 'BG',
    name: 'Europe/Sofia',
    utcOffset: '+02:00',
  },
  {
    countryCode: 'BF',
    name: 'Africa/Ouagadougou',
    utcOffset: '+00:00',
  },
  {
    countryCode: 'BI',
    name: 'Africa/Bujumbura',
    utcOffset: '+02:00',
  },
  {
    countryCode: 'KH',
    name: 'Asia/Phnom_Penh',
    utcOffset: '+07:00',
  },
  {
    countryCode: 'CM',
    name: 'Africa/Douala',
    utcOffset: '+01:00',
  },
  {
    countryCode: 'CA',
    name: 'America/Atikokan',
    utcOffset: '-05:00',
  },
  {
    countryCode: 'CA',
    name: 'America/Blanc-Sablon',
    utcOffset: '-04:00',
  },
  {
    countryCode: 'CA',
    name: 'America/Cambridge_Bay',
    utcOffset: '-07:00',
  },
  {
    countryCode: 'CA',
    name: 'America/Creston',
    utcOffset: '-07:00',
  },
  {
    countryCode: 'CA',
    name: 'America/Dawson',
    utcOffset: '-07:00',
  },
  {
    countryCode: 'CA',
    name: 'America/Dawson_Creek',
    utcOffset: '-07:00',
  },
  {
    countryCode: 'CA',
    name: 'America/Edmonton',
    utcOffset: '-07:00',
  },
  {
    countryCode: 'CA',
    name: 'America/Fort_Nelson',
    utcOffset: '-07:00',
  },
  {
    countryCode: 'CA',
    name: 'America/Glace_Bay',
    utcOffset: '-04:00',
  },
  {
    countryCode: 'CA',
    name: 'America/Goose_Bay',
    utcOffset: '-04:00',
  },
  {
    countryCode: 'CA',
    name: 'America/Halifax',
    utcOffset: '-04:00',
  },
  {
    countryCode: 'CA',
    name: 'America/Inuvik',
    utcOffset: '-07:00',
  },
  {
    countryCode: 'CA',
    name: 'America/Iqaluit',
    utcOffset: '-05:00',
  },
  {
    countryCode: 'CA',
    name: 'America/Moncton',
    utcOffset: '-04:00',
  },
  {
    countryCode: 'CA',
    name: 'America/Rankin_Inlet',
    utcOffset: '-06:00',
  },
  {
    countryCode: 'CA',
    name: 'America/Regina',
    utcOffset: '-06:00',
  },
  {
    countryCode: 'CA',
    name: 'America/Resolute',
    utcOffset: '-06:00',
  },
  {
    countryCode: 'CA',
    name: 'America/St_Johns',
    utcOffset: '-03:30',
  },
  {
    countryCode: 'CA',
    name: 'America/Swift_Current',
    utcOffset: '-06:00',
  },
  {
    countryCode: 'CA',
    name: 'America/Toronto',
    utcOffset: '-05:00',
  },
  {
    countryCode: 'CA',
    name: 'America/Vancouver',
    utcOffset: '-08:00',
  },
  {
    countryCode: 'CA',
    name: 'America/Whitehorse',
    utcOffset: '-07:00',
  },
  {
    countryCode: 'CA',
    name: 'America/Winnipeg',
    utcOffset: '-06:00',
  },
  {
    countryCode: 'CV',
    name: 'Atlantic/Cape_Verde',
    utcOffset: '-01:00',
  },
  {
    countryCode: 'KY',
    name: 'America/Cayman',
    utcOffset: '-05:00',
  },
  {
    countryCode: 'CF',
    name: 'Africa/Bangui',
    utcOffset: '+01:00',
  },
  {
    countryCode: 'TD',
    name: 'Africa/Ndjamena',
    utcOffset: '+01:00',
  },
  {
    countryCode: 'CL',
    name: 'America/Punta_Arenas',
    utcOffset: '-03:00',
  },
  {
    countryCode: 'CL',
    name: 'America/Santiago',
    utcOffset: '-03:00',
  },
  {
    countryCode: 'CL',
    name: 'Pacific/Easter',
    utcOffset: '-05:00',
  },
  {
    countryCode: 'CN',
    name: 'Asia/Shanghai',
    utcOffset: '+08:00',
  },
  {
    countryCode: 'CN',
    name: 'Asia/Urumqi',
    utcOffset: '+06:00',
  },
  {
    countryCode: 'CX',
    name: 'Indian/Christmas',
    utcOffset: '+07:00',
  },
  {
    countryCode: 'CC',
    name: 'Indian/Cocos',
    utcOffset: '+06:30',
  },
  {
    countryCode: 'CO',
    name: 'America/Bogota',
    utcOffset: '-05:00',
  },
  {
    countryCode: 'KM',
    name: 'Indian/Comoro',
    utcOffset: '+03:00',
  },
  {
    countryCode: 'CG',
    name: 'Africa/Brazzaville',
    utcOffset: '+01:00',
  },
  {
    countryCode: 'CD',
    name: 'Africa/Kinshasa',
    utcOffset: '+01:00',
  },
  {
    countryCode: 'CD',
    name: 'Africa/Lubumbashi',
    utcOffset: '+02:00',
  },
  {
    countryCode: 'CK',
    name: 'Pacific/Rarotonga',
    utcOffset: '-10:00',
  },
  {
    countryCode: 'CR',
    name: 'America/Costa_Rica',
    utcOffset: '-06:00',
  },
  {
    countryCode: 'HR',
    name: 'Europe/Zagreb',
    utcOffset: '+01:00',
  },
  {
    countryCode: 'CU',
    name: 'America/Havana',
    utcOffset: '-05:00',
  },
  {
    countryCode: 'CW',
    name: 'America/Curacao',
    utcOffset: '-04:00',
  },
  {
    countryCode: 'CY',
    name: 'Asia/Famagusta',
    utcOffset: '+02:00',
  },
  {
    countryCode: 'CY',
    name: 'Asia/Nicosia',
    utcOffset: '+02:00',
  },
  {
    countryCode: 'CZ',
    name: 'Europe/Prague',
    utcOffset: '+01:00',
  },
  {
    countryCode: 'CI',
    name: 'Africa/Abidjan',
    utcOffset: '+00:00',
  },
  {
    countryCode: 'DK',
    name: 'Europe/Copenhagen',
    utcOffset: '+01:00',
  },
  {
    countryCode: 'DJ',
    name: 'Africa/Djibouti',
    utcOffset: '+03:00',
  },
  {
    countryCode: 'DM',
    name: 'America/Dominica',
    utcOffset: '-04:00',
  },
  {
    countryCode: 'DO',
    name: 'America/Santo_Domingo',
    utcOffset: '-04:00',
  },
  {
    countryCode: 'EC',
    name: 'America/Guayaquil',
    utcOffset: '-05:00',
  },
  {
    countryCode: 'EC',
    name: 'Pacific/Galapagos',
    utcOffset: '-06:00',
  },
  {
    countryCode: 'EG',
    name: 'Africa/Cairo',
    utcOffset: '+02:00',
  },
  {
    countryCode: 'SV',
    name: 'America/El_Salvador',
    utcOffset: '-06:00',
  },
  {
    countryCode: 'GQ',
    name: 'Africa/Malabo',
    utcOffset: '+01:00',
  },
  {
    countryCode: 'ER',
    name: 'Africa/Asmara',
    utcOffset: '+03:00',
  },
  {
    countryCode: 'ER',
    name: 'Africa/Asmera',
    utcOffset: '+03:00',
  },
  {
    countryCode: 'EE',
    name: 'Europe/Tallinn',
    utcOffset: '+02:00',
  },
  {
    countryCode: 'ET',
    name: 'Africa/Addis_Ababa',
    utcOffset: '+03:00',
  },
  {
    countryCode: 'FK',
    name: 'Atlantic/Stanley',
    utcOffset: '-03:00',
  },
  {
    countryCode: 'FO',
    name: 'Atlantic/Faroe',
    utcOffset: '+00:00',
  },
  {
    countryCode: 'FJ',
    name: 'Pacific/Fiji',
    utcOffset: '+12:00',
  },
  {
    countryCode: 'FI',
    name: 'Europe/Helsinki',
    utcOffset: '+02:00',
  },
  {
    countryCode: 'FR',
    name: 'Europe/Paris',
    utcOffset: '+01:00',
  },
  {
    countryCode: 'GF',
    name: 'America/Cayenne',
    utcOffset: '-03:00',
  },
  {
    countryCode: 'PF',
    name: 'Pacific/Gambier',
    utcOffset: '-09:00',
  },
  {
    countryCode: 'PF',
    name: 'Pacific/Marquesas',
    utcOffset: '-09:30',
  },
  {
    countryCode: 'PF',
    name: 'Pacific/Tahiti',
    utcOffset: '-10:00',
  },
  {
    countryCode: 'TF',
    name: 'Indian/Kerguelen',
    utcOffset: '+05:00',
  },
  {
    countryCode: 'GA',
    name: 'Africa/Libreville',
    utcOffset: '+01:00',
  },
  {
    countryCode: 'GM',
    name: 'Africa/Banjul',
    utcOffset: '+00:00',
  },
  {
    countryCode: 'GE',
    name: 'Asia/Tbilisi',
    utcOffset: '+04:00',
  },
  {
    countryCode: 'DE',
    name: 'Europe/Berlin',
    utcOffset: '+01:00',
  },
  {
    countryCode: 'DE',
    name: 'Europe/Busingen',
    utcOffset: '+01:00',
  },
  {
    countryCode: 'GH',
    name: 'Africa/Accra',
    utcOffset: '+00:00',
  },
  {
    countryCode: 'GI',
    name: 'Europe/Gibraltar',
    utcOffset: '+01:00',
  },
  {
    countryCode: 'GR',
    name: 'Europe/Athens',
    utcOffset: '+02:00',
  },
  {
    countryCode: 'GL',
    name: 'America/Danmarkshavn',
    utcOffset: '+00:00',
  },
  {
    countryCode: 'GL',
    name: 'America/Nuuk',
    utcOffset: '-02:00',
  },
  {
    countryCode: 'GL',
    name: 'America/Scoresbysund',
    utcOffset: '-01:00',
  },
  {
    countryCode: 'GL',
    name: 'America/Thule',
    utcOffset: '-04:00',
  },
  {
    countryCode: 'GD',
    name: 'America/Grenada',
    utcOffset: '-04:00',
  },
  {
    countryCode: 'GP',
    name: 'America/Guadeloupe',
    utcOffset: '-04:00',
  },
  {
    countryCode: 'GU',
    name: 'Pacific/Guam',
    utcOffset: '+10:00',
  },
  {
    countryCode: 'GT',
    name: 'America/Guatemala',
    utcOffset: '-06:00',
  },
  {
    countryCode: 'GG',
    name: 'Europe/Guernsey',
    utcOffset: '+00:00',
  },
  {
    countryCode: 'GN',
    name: 'Africa/Conakry',
    utcOffset: '+00:00',
  },
  {
    countryCode: 'GW',
    name: 'Africa/Bissau',
    utcOffset: '+00:00',
  },
  {
    countryCode: 'GY',
    name: 'America/Guyana',
    utcOffset: '-04:00',
  },
  {
    countryCode: 'HT',
    name: 'America/Port-au-Prince',
    utcOffset: '-05:00',
  },
  {
    countryCode: 'VA',
    name: 'Europe/Vatican',
    utcOffset: '+01:00',
  },
  {
    countryCode: 'HN',
    name: 'America/Tegucigalpa',
    utcOffset: '-06:00',
  },
  {
    countryCode: 'HK',
    name: 'Asia/Hong_Kong',
    utcOffset: '+08:00',
  },
  {
    countryCode: 'HU',
    name: 'Europe/Budapest',
    utcOffset: '+01:00',
  },
  {
    countryCode: 'IS',
    name: 'Atlantic/Reykjavik',
    utcOffset: '+00:00',
  },
  {
    countryCode: 'IN',
    name: 'Asia/Kolkata',
    utcOffset: '+05:30',
  },
  {
    countryCode: 'ID',
    name: 'Asia/Jakarta',
    utcOffset: '+07:00',
  },
  {
    countryCode: 'ID',
    name: 'Asia/Jayapura',
    utcOffset: '+09:00',
  },
  {
    countryCode: 'ID',
    name: 'Asia/Makassar',
    utcOffset: '+08:00',
  },
  {
    countryCode: 'ID',
    name: 'Asia/Pontianak',
    utcOffset: '+07:00',
  },
  {
    countryCode: 'IR',
    name: 'Asia/Tehran',
    utcOffset: '+03:30',
  },
  {
    countryCode: 'IQ',
    name: 'Asia/Baghdad',
    utcOffset: '+03:00',
  },
  {
    countryCode: 'IE',
    name: 'Europe/Dublin',
    utcOffset: '+00:00',
  },
  {
    countryCode: 'IM',
    name: 'Europe/Isle_of_Man',
    utcOffset: '+00:00',
  },
  {
    countryCode: 'IL',
    name: 'Asia/Jerusalem',
    utcOffset: '+02:00',
  },
  {
    countryCode: 'IT',
    name: 'Europe/Rome',
    utcOffset: '+01:00',
  },
  {
    countryCode: 'JM',
    name: 'America/Jamaica',
    utcOffset: '-05:00',
  },
  {
    countryCode: 'JP',
    name: 'Asia/Tokyo',
    utcOffset: '+09:00',
  },
  {
    countryCode: 'JE',
    name: 'Europe/Jersey',
    utcOffset: '+00:00',
  },
  {
    countryCode: 'JO',
    name: 'Asia/Amman',
    utcOffset: '+03:00',
  },
  {
    countryCode: 'KZ',
    name: 'Asia/Almaty',
    utcOffset: '+06:00',
  },
  {
    countryCode: 'KZ',
    name: 'Asia/Aqtau',
    utcOffset: '+05:00',
  },
  {
    countryCode: 'KZ',
    name: 'Asia/Aqtobe',
    utcOffset: '+05:00',
  },
  {
    countryCode: 'KZ',
    name: 'Asia/Atyrau',
    utcOffset: '+05:00',
  },
  {
    countryCode: 'KZ',
    name: 'Asia/Oral',
    utcOffset: '+05:00',
  },
  {
    countryCode: 'KZ',
    name: 'Asia/Qostanay',
    utcOffset: '+06:00',
  },
  {
    countryCode: 'KZ',
    name: 'Asia/Qyzylorda',
    utcOffset: '+05:00',
  },
  {
    countryCode: 'KE',
    name: 'Africa/Nairobi',
    utcOffset: '+03:00',
  },
  {
    countryCode: 'KI',
    name: 'Pacific/Kanton',
    utcOffset: '+13:00',
  },
  {
    countryCode: 'KI',
    name: 'Pacific/Kiritimati',
    utcOffset: '+14:00',
  },
  {
    countryCode: 'KI',
    name: 'Pacific/Tarawa',
    utcOffset: '+12:00',
  },
  {
    countryCode: 'KP',
    name: 'Asia/Pyongyang',
    utcOffset: '+09:00',
  },
  {
    countryCode: 'KR',
    name: 'Asia/Seoul',
    utcOffset: '+09:00',
  },
  {
    countryCode: 'KW',
    name: 'Asia/Kuwait',
    utcOffset: '+03:00',
  },
  {
    countryCode: 'KG',
    name: 'Asia/Bishkek',
    utcOffset: '+06:00',
  },
  {
    countryCode: 'LA',
    name: 'Asia/Vientiane',
    utcOffset: '+07:00',
  },
  {
    countryCode: 'LV',
    name: 'Europe/Riga',
    utcOffset: '+02:00',
  },
  {
    countryCode: 'LB',
    name: 'Asia/Beirut',
    utcOffset: '+02:00',
  },
  {
    countryCode: 'LS',
    name: 'Africa/Maseru',
    utcOffset: '+02:00',
  },
  {
    countryCode: 'LR',
    name: 'Africa/Monrovia',
    utcOffset: '+00:00',
  },
  {
    countryCode: 'LY',
    name: 'Africa/Tripoli',
    utcOffset: '+02:00',
  },
  {
    countryCode: 'LI',
    name: 'Europe/Vaduz',
    utcOffset: '+01:00',
  },
  {
    countryCode: 'LT',
    name: 'Europe/Vilnius',
    utcOffset: '+02:00',
  },
  {
    countryCode: 'LU',
    name: 'Europe/Luxembourg',
    utcOffset: '+01:00',
  },
  {
    countryCode: 'MO',
    name: 'Asia/Macau',
    utcOffset: '+08:00',
  },
  {
    countryCode: 'MK',
    name: 'Europe/Skopje',
    utcOffset: '+01:00',
  },
  {
    countryCode: 'MG',
    name: 'Indian/Antananarivo',
    utcOffset: '+03:00',
  },
  {
    countryCode: 'MW',
    name: 'Africa/Blantyre',
    utcOffset: '+02:00',
  },
  {
    countryCode: 'MY',
    name: 'Asia/Kuala_Lumpur',
    utcOffset: '+08:00',
  },
  {
    countryCode: 'MY',
    name: 'Asia/Kuching',
    utcOffset: '+08:00',
  },
  {
    countryCode: 'MV',
    name: 'Indian/Maldives',
    utcOffset: '+05:00',
  },
  {
    countryCode: 'ML',
    name: 'Africa/Bamako',
    utcOffset: '+00:00',
  },
  {
    countryCode: 'MT',
    name: 'Europe/Malta',
    utcOffset: '+01:00',
  },
  {
    countryCode: 'MH',
    name: 'Pacific/Kwajalein',
    utcOffset: '+12:00',
  },
  {
    countryCode: 'MH',
    name: 'Pacific/Majuro',
    utcOffset: '+12:00',
  },
  {
    countryCode: 'MQ',
    name: 'America/Martinique',
    utcOffset: '-04:00',
  },
  {
    countryCode: 'MR',
    name: 'Africa/Nouakchott',
    utcOffset: '+00:00',
  },
  {
    countryCode: 'MU',
    name: 'Indian/Mauritius',
    utcOffset: '+04:00',
  },
  {
    countryCode: 'YT',
    name: 'Indian/Mayotte',
    utcOffset: '+03:00',
  },
  {
    countryCode: 'MX',
    name: 'America/Bahia_Banderas',
    utcOffset: '-06:00',
  },
  {
    countryCode: 'MX',
    name: 'America/Cancun',
    utcOffset: '-05:00',
  },
  {
    countryCode: 'MX',
    name: 'America/Chihuahua',
    utcOffset: '-06:00',
  },
  {
    countryCode: 'MX',
    name: 'America/Ciudad_Juarez',
    utcOffset: '-07:00',
  },
  {
    countryCode: 'MX',
    name: 'America/Hermosillo',
    utcOffset: '-07:00',
  },
  {
    countryCode: 'MX',
    name: 'America/Matamoros',
    utcOffset: '-06:00',
  },
  {
    countryCode: 'MX',
    name: 'America/Mazatlan',
    utcOffset: '-07:00',
  },
  {
    countryCode: 'MX',
    name: 'America/Merida',
    utcOffset: '-06:00',
  },
  {
    countryCode: 'MX',
    name: 'America/Mexico_City',
    utcOffset: '-06:00',
  },
  {
    countryCode: 'MX',
    name: 'America/Monterrey',
    utcOffset: '-06:00',
  },
  {
    countryCode: 'MX',
    name: 'America/Ojinaga',
    utcOffset: '-06:00',
  },
  {
    countryCode: 'MX',
    name: 'America/Tijuana',
    utcOffset: '-08:00',
  },
  {
    countryCode: 'FM',
    name: 'Pacific/Chuuk',
    utcOffset: '+10:00',
  },
  {
    countryCode: 'FM',
    name: 'Pacific/Kosrae',
    utcOffset: '+11:00',
  },
  {
    countryCode: 'FM',
    name: 'Pacific/Pohnpei',
    utcOffset: '+11:00',
  },
  {
    countryCode: 'MD',
    name: 'Europe/Chisinau',
    utcOffset: '+02:00',
  },
  {
    countryCode: 'MC',
    name: 'Europe/Monaco',
    utcOffset: '+01:00',
  },
  {
    countryCode: 'MN',
    name: 'Asia/Choibalsan',
    utcOffset: '+08:00',
  },
  {
    countryCode: 'MN',
    name: 'Asia/Hovd',
    utcOffset: '+07:00',
  },
  {
    countryCode: 'MN',
    name: 'Asia/Ulaanbaatar',
    utcOffset: '+08:00',
  },
  {
    countryCode: 'ME',
    name: 'Europe/Podgorica',
    utcOffset: '+01:00',
  },
  {
    countryCode: 'MS',
    name: 'America/Montserrat',
    utcOffset: '-04:00',
  },
  {
    countryCode: 'MA',
    name: 'Africa/Casablanca',
    utcOffset: '+01:00',
  },
  {
    countryCode: 'MA',
    name: 'Africa/El_Aaiun',
    utcOffset: '+01:00',
  },
  {
    countryCode: 'MZ',
    name: 'Africa/Maputo',
    utcOffset: '+02:00',
  },
  {
    countryCode: 'MM',
    name: 'Asia/Yangon',
    utcOffset: '+06:30',
  },
  {
    countryCode: 'NA',
    name: 'Africa/Windhoek',
    utcOffset: '+02:00',
  },
  {
    countryCode: 'NR',
    name: 'Pacific/Nauru',
    utcOffset: '+12:00',
  },
  {
    countryCode: 'NP',
    name: 'Asia/Kathmandu',
    utcOffset: '+05:45',
  },
  {
    countryCode: 'NL',
    name: 'Europe/Amsterdam',
    utcOffset: '+01:00',
  },
  {
    countryCode: 'NC',
    name: 'Pacific/Noumea',
    utcOffset: '+11:00',
  },
  {
    countryCode: 'NZ',
    name: 'Pacific/Auckland',
    utcOffset: '+13:00',
  },
  {
    countryCode: 'NZ',
    name: 'Pacific/Chatham',
    utcOffset: '+13:45',
  },
  {
    countryCode: 'NI',
    name: 'America/Managua',
    utcOffset: '-06:00',
  },
  {
    countryCode: 'NE',
    name: 'Africa/Niamey',
    utcOffset: '+01:00',
  },
  {
    countryCode: 'NG',
    name: 'Africa/Lagos',
    utcOffset: '+01:00',
  },
  {
    countryCode: 'NU',
    name: 'Pacific/Niue',
    utcOffset: '-11:00',
  },
  {
    countryCode: 'NF',
    name: 'Pacific/Norfolk',
    utcOffset: '+12:00',
  },
  {
    countryCode: 'MP',
    name: 'Pacific/Saipan',
    utcOffset: '+10:00',
  },
  {
    countryCode: 'NO',
    name: 'Europe/Oslo',
    utcOffset: '+01:00',
  },
  {
    countryCode: 'OM',
    name: 'Asia/Muscat',
    utcOffset: '+04:00',
  },
  {
    countryCode: 'PK',
    name: 'Asia/Karachi',
    utcOffset: '+05:00',
  },
  {
    countryCode: 'PW',
    name: 'Pacific/Palau',
    utcOffset: '+09:00',
  },
  {
    countryCode: 'PS',
    name: 'Asia/Gaza',
    utcOffset: '+02:00',
  },
  {
    countryCode: 'PS',
    name: 'Asia/Hebron',
    utcOffset: '+02:00',
  },
  {
    countryCode: 'PA',
    name: 'America/Panama',
    utcOffset: '-05:00',
  },
  {
    countryCode: 'PG',
    name: 'Pacific/Bougainville',
    utcOffset: '+11:00',
  },
  {
    countryCode: 'PG',
    name: 'Pacific/Port_Moresby',
    utcOffset: '+10:00',
  },
  {
    countryCode: 'PY',
    name: 'America/Asuncion',
    utcOffset: '-03:00',
  },
  {
    countryCode: 'PE',
    name: 'America/Lima',
    utcOffset: '-05:00',
  },
  {
    countryCode: 'PH',
    name: 'Asia/Manila',
    utcOffset: '+08:00',
  },
  {
    countryCode: 'PN',
    name: 'Pacific/Pitcairn',
    utcOffset: '-08:00',
  },
  {
    countryCode: 'PL',
    name: 'Europe/Warsaw',
    utcOffset: '+01:00',
  },
  {
    countryCode: 'PT',
    name: 'Atlantic/Azores',
    utcOffset: '-01:00',
  },
  {
    countryCode: 'PT',
    name: 'Atlantic/Madeira',
    utcOffset: '+00:00',
  },
  {
    countryCode: 'PT',
    name: 'Europe/Lisbon',
    utcOffset: '+00:00',
  },
  {
    countryCode: 'PR',
    name: 'America/Puerto_Rico',
    utcOffset: '-04:00',
  },
  {
    countryCode: 'QA',
    name: 'Asia/Qatar',
    utcOffset: '+03:00',
  },
  {
    countryCode: 'RO',
    name: 'Europe/Bucharest',
    utcOffset: '+02:00',
  },
  {
    countryCode: 'RU',
    name: 'Asia/Anadyr',
    utcOffset: '+12:00',
  },
  {
    countryCode: 'RU',
    name: 'Asia/Barnaul',
    utcOffset: '+07:00',
  },
  {
    countryCode: 'RU',
    name: 'Asia/Chita',
    utcOffset: '+09:00',
  },
  {
    countryCode: 'RU',
    name: 'Asia/Irkutsk',
    utcOffset: '+08:00',
  },
  {
    countryCode: 'RU',
    name: 'Asia/Kamchatka',
    utcOffset: '+12:00',
  },
  {
    countryCode: 'RU',
    name: 'Asia/Khandyga',
    utcOffset: '+09:00',
  },
  {
    countryCode: 'RU',
    name: 'Asia/Krasnoyarsk',
    utcOffset: '+07:00',
  },
  {
    countryCode: 'RU',
    name: 'Asia/Magadan',
    utcOffset: '+11:00',
  },
  {
    countryCode: 'RU',
    name: 'Asia/Novokuznetsk',
    utcOffset: '+07:00',
  },
  {
    countryCode: 'RU',
    name: 'Asia/Novosibirsk',
    utcOffset: '+07:00',
  },
  {
    countryCode: 'RU',
    name: 'Asia/Omsk',
    utcOffset: '+06:00',
  },
  {
    countryCode: 'RU',
    name: 'Asia/Sakhalin',
    utcOffset: '+11:00',
  },
  {
    countryCode: 'RU',
    name: 'Asia/Srednekolymsk',
    utcOffset: '+11:00',
  },
  {
    countryCode: 'RU',
    name: 'Asia/Tomsk',
    utcOffset: '+07:00',
  },
  {
    countryCode: 'RU',
    name: 'Asia/Ust-Nera',
    utcOffset: '+10:00',
  },
  {
    countryCode: 'RU',
    name: 'Asia/Vladivostok',
    utcOffset: '+10:00',
  },
  {
    countryCode: 'RU',
    name: 'Asia/Yakutsk',
    utcOffset: '+09:00',
  },
  {
    countryCode: 'RU',
    name: 'Asia/Yekaterinburg',
    utcOffset: '+05:00',
  },
  {
    countryCode: 'RU',
    name: 'Europe/Astrakhan',
    utcOffset: '+04:00',
  },
  {
    countryCode: 'RU',
    name: 'Europe/Kaliningrad',
    utcOffset: '+02:00',
  },
  {
    countryCode: 'RU',
    name: 'Europe/Kirov',
    utcOffset: '+03:00',
  },
  {
    countryCode: 'RU',
    name: 'Europe/Moscow',
    utcOffset: '+03:00',
  },
  {
    countryCode: 'RU',
    name: 'Europe/Samara',
    utcOffset: '+04:00',
  },
  {
    countryCode: 'RU',
    name: 'Europe/Saratov',
    utcOffset: '+04:00',
  },
  {
    countryCode: 'RU',
    name: 'Europe/Ulyanovsk',
    utcOffset: '+04:00',
  },
  {
    countryCode: 'RU',
    name: 'Europe/Volgograd',
    utcOffset: '+03:00',
  },
  {
    countryCode: 'RW',
    name: 'Africa/Kigali',
    utcOffset: '+02:00',
  },
  {
    countryCode: 'RE',
    name: 'Indian/Reunion',
    utcOffset: '+04:00',
  },
  {
    countryCode: 'BL',
    name: 'America/St_Barthelemy',
    utcOffset: '-04:00',
  },
  {
    countryCode: 'SH',
    name: 'Atlantic/St_Helena',
    utcOffset: '+00:00',
  },
  {
    countryCode: 'KN',
    name: 'America/St_Kitts',
    utcOffset: '-04:00',
  },
  {
    countryCode: 'LC',
    name: 'America/St_Lucia',
    utcOffset: '-04:00',
  },
  {
    countryCode: 'MF',
    name: 'America/Marigot',
    utcOffset: '-04:00',
  },
  {
    countryCode: 'PM',
    name: 'America/Miquelon',
    utcOffset: '-03:00',
  },
  {
    countryCode: 'VC',
    name: 'America/St_Vincent',
    utcOffset: '-04:00',
  },
  {
    countryCode: 'WS',
    name: 'Pacific/Apia',
    utcOffset: '+13:00',
  },
  {
    countryCode: 'SM',
    name: 'Europe/San_Marino',
    utcOffset: '+01:00',
  },
  {
    countryCode: 'ST',
    name: 'Africa/Sao_Tome',
    utcOffset: '+00:00',
  },
  {
    countryCode: 'SA',
    name: 'Asia/Riyadh',
    utcOffset: '+03:00',
  },
  {
    countryCode: 'SN',
    name: 'Africa/Dakar',
    utcOffset: '+00:00',
  },
  {
    countryCode: 'RS',
    name: 'Europe/Belgrade',
    utcOffset: '+01:00',
  },
  {
    countryCode: 'SC',
    name: 'Indian/Mahe',
    utcOffset: '+04:00',
  },
  {
    countryCode: 'SL',
    name: 'Africa/Freetown',
    utcOffset: '+00:00',
  },
  {
    countryCode: 'SG',
    name: 'Asia/Singapore',
    utcOffset: '+08:00',
  },
  {
    countryCode: 'SX',
    name: 'America/Lower_Princes',
    utcOffset: '-04:00',
  },
  {
    countryCode: 'SK',
    name: 'Europe/Bratislava',
    utcOffset: '+01:00',
  },
  {
    countryCode: 'SI',
    name: 'Europe/Ljubljana',
    utcOffset: '+01:00',
  },
  {
    countryCode: 'SB',
    name: 'Pacific/Guadalcanal',
    utcOffset: '+11:00',
  },
  {
    countryCode: 'SO',
    name: 'Africa/Mogadishu',
    utcOffset: '+03:00',
  },
  {
    countryCode: 'ZA',
    name: 'Africa/Johannesburg',
    utcOffset: '+02:00',
  },
  {
    countryCode: 'GS',
    name: 'Atlantic/South_Georgia',
    utcOffset: '-02:00',
  },
  {
    countryCode: 'SS',
    name: 'Africa/Juba',
    utcOffset: '+02:00',
  },
  {
    countryCode: 'ES',
    name: 'Africa/Ceuta',
    utcOffset: '+01:00',
  },
  {
    countryCode: 'ES',
    name: 'Atlantic/Canary',
    utcOffset: '+00:00',
  },
  {
    countryCode: 'ES',
    name: 'Europe/Madrid',
    utcOffset: '+01:00',
  },
  {
    countryCode: 'LK',
    name: 'Asia/Colombo',
    utcOffset: '+05:30',
  },
  {
    countryCode: 'SD',
    name: 'Africa/Khartoum',
    utcOffset: '+02:00',
  },
  {
    countryCode: 'SR',
    name: 'America/Paramaribo',
    utcOffset: '-03:00',
  },
  {
    countryCode: 'SJ',
    name: 'Arctic/Longyearbyen',
    utcOffset: '+01:00',
  },
  {
    countryCode: 'SZ',
    name: 'Africa/Mbabane',
    utcOffset: '+02:00',
  },
  {
    countryCode: 'SE',
    name: 'Europe/Stockholm',
    utcOffset: '+01:00',
  },
  {
    countryCode: 'CH',
    name: 'Europe/Zurich',
    utcOffset: '+01:00',
  },
  {
    countryCode: 'SY',
    name: 'Asia/Damascus',
    utcOffset: '+03:00',
  },
  {
    countryCode: 'TW',
    name: 'Asia/Taipei',
    utcOffset: '+08:00',
  },
  {
    countryCode: 'TJ',
    name: 'Asia/Dushanbe',
    utcOffset: '+05:00',
  },
  {
    countryCode: 'TZ',
    name: 'Africa/Dar_es_Salaam',
    utcOffset: '+03:00',
  },
  {
    countryCode: 'TH',
    name: 'Asia/Bangkok',
    utcOffset: '+07:00',
  },
  {
    countryCode: 'TL',
    name: 'Asia/Dili',
    utcOffset: '+09:00',
  },
  {
    countryCode: 'TG',
    name: 'Africa/Lome',
    utcOffset: '+00:00',
  },
  {
    countryCode: 'TK',
    name: 'Pacific/Fakaofo',
    utcOffset: '+13:00',
  },
  {
    countryCode: 'TO',
    name: 'Pacific/Tongatapu',
    utcOffset: '+13:00',
  },
  {
    countryCode: 'TT',
    name: 'America/Port_of_Spain',
    utcOffset: '-04:00',
  },
  {
    countryCode: 'TN',
    name: 'Africa/Tunis',
    utcOffset: '+01:00',
  },
  {
    countryCode: 'TR',
    name: 'Europe/Istanbul',
    utcOffset: '+03:00',
  },
  {
    countryCode: 'TM',
    name: 'Asia/Ashgabat',
    utcOffset: '+05:00',
  },
  {
    countryCode: 'TC',
    name: 'America/Grand_Turk',
    utcOffset: '-05:00',
  },
  {
    countryCode: 'TV',
    name: 'Pacific/Funafuti',
    utcOffset: '+12:00',
  },
  {
    countryCode: 'UG',
    name: 'Africa/Kampala',
    utcOffset: '+03:00',
  },
  {
    countryCode: 'UA',
    name: 'Europe/Kyiv',
    utcOffset: '+02:00',
  },
  {
    countryCode: 'UA',
    name: 'Europe/Simferopol',
    utcOffset: '+03:00',
  },
  {
    countryCode: 'AE',
    name: 'Asia/Dubai',
    utcOffset: '+04:00',
  },
  {
    countryCode: 'GB',
    name: 'Europe/London',
    utcOffset: '+00:00',
  },
  {
    countryCode: 'US',
    name: 'America/Adak',
    utcOffset: '-10:00',
  },
  {
    countryCode: 'US',
    name: 'America/Anchorage',
    utcOffset: '-09:00',
  },
  {
    countryCode: 'US',
    name: 'America/Boise',
    utcOffset: '-07:00',
  },
  {
    countryCode: 'US',
    name: 'America/Chicago',
    utcOffset: '-06:00',
  },
  {
    countryCode: 'US',
    name: 'America/Denver',
    utcOffset: '-07:00',
  },
  {
    countryCode: 'US',
    name: 'America/Detroit',
    utcOffset: '-05:00',
  },
  {
    countryCode: 'US',
    name: 'America/Indiana/Indianapolis',
    utcOffset: '-05:00',
  },
  {
    countryCode: 'US',
    name: 'America/Indiana/Knox',
    utcOffset: '-06:00',
  },
  {
    countryCode: 'US',
    name: 'America/Indiana/Marengo',
    utcOffset: '-05:00',
  },
  {
    countryCode: 'US',
    name: 'America/Indiana/Petersburg',
    utcOffset: '-05:00',
  },
  {
    countryCode: 'US',
    name: 'America/Indiana/Tell_City',
    utcOffset: '-06:00',
  },
  {
    countryCode: 'US',
    name: 'America/Indiana/Vevay',
    utcOffset: '-05:00',
  },
  {
    countryCode: 'US',
    name: 'America/Indiana/Vincennes',
    utcOffset: '-05:00',
  },
  {
    countryCode: 'US',
    name: 'America/Indiana/Winamac',
    utcOffset: '-05:00',
  },
  {
    countryCode: 'US',
    name: 'America/Juneau',
    utcOffset: '-09:00',
  },
  {
    countryCode: 'US',
    name: 'America/Kentucky/Louisville',
    utcOffset: '-05:00',
  },
  {
    countryCode: 'US',
    name: 'America/Kentucky/Monticello',
    utcOffset: '-05:00',
  },
  {
    countryCode: 'US',
    name: 'America/Los_Angeles',
    utcOffset: '-08:00',
  },
  {
    countryCode: 'US',
    name: 'America/Menominee',
    utcOffset: '-06:00',
  },
  {
    countryCode: 'US',
    name: 'America/Metlakatla',
    utcOffset: '-09:00',
  },
  {
    countryCode: 'US',
    name: 'America/New_York',
    utcOffset: '-05:00',
  },
  {
    countryCode: 'US',
    name: 'America/Nome',
    utcOffset: '-09:00',
  },
  {
    countryCode: 'US',
    name: 'America/North_Dakota/Beulah',
    utcOffset: '-06:00',
  },
  {
    countryCode: 'US',
    name: 'America/North_Dakota/Center',
    utcOffset: '-06:00',
  },
  {
    countryCode: 'US',
    name: 'America/North_Dakota/New_Salem',
    utcOffset: '-06:00',
  },
  {
    countryCode: 'US',
    name: 'America/Phoenix',
    utcOffset: '-07:00',
  },
  {
    countryCode: 'US',
    name: 'America/Sitka',
    utcOffset: '-09:00',
  },
  {
    countryCode: 'US',
    name: 'America/Yakutat',
    utcOffset: '-09:00',
  },
  {
    countryCode: 'US',
    name: 'Pacific/Honolulu',
    utcOffset: '-10:00',
  },
  {
    countryCode: 'UM',
    name: 'Pacific/Midway',
    utcOffset: '-11:00',
  },
  {
    countryCode: 'UM',
    name: 'Pacific/Wake',
    utcOffset: '+12:00',
  },
  {
    countryCode: 'UY',
    name: 'America/Montevideo',
    utcOffset: '-03:00',
  },
  {
    countryCode: 'UZ',
    name: 'Asia/Samarkand',
    utcOffset: '+05:00',
  },
  {
    countryCode: 'UZ',
    name: 'Asia/Tashkent',
    utcOffset: '+05:00',
  },
  {
    countryCode: 'VU',
    name: 'Pacific/Efate',
    utcOffset: '+11:00',
  },
  {
    countryCode: 'VE',
    name: 'America/Caracas',
    utcOffset: '-04:00',
  },
  {
    countryCode: 'VN',
    name: 'Asia/Ho_Chi_Minh',
    utcOffset: '+07:00',
  },
  {
    countryCode: 'VG',
    name: 'America/Tortola',
    utcOffset: '-04:00',
  },
  {
    countryCode: 'VI',
    name: 'America/St_Thomas',
    utcOffset: '-04:00',
  },
  {
    countryCode: 'WF',
    name: 'Pacific/Wallis',
    utcOffset: '+12:00',
  },
  {
    countryCode: 'YE',
    name: 'Asia/Aden',
    utcOffset: '+03:00',
  },
  {
    countryCode: 'ZM',
    name: 'Africa/Lusaka',
    utcOffset: '+02:00',
  },
  {
    countryCode: 'ZW',
    name: 'Africa/Harare',
    utcOffset: '+02:00',
  },
  {
    countryCode: 'AX',
    name: 'Europe/Mariehamn',
    utcOffset: '+02:00',
  },
  {
    countryCode: '',
    name: 'Etc/GMT',
    utcOffset: '+00:00',
  },
  {
    countryCode: '',
    name: 'Etc/GMT+1',
    utcOffset: '−01:00',
  },
  {
    countryCode: '',
    name: 'Etc/GMT+10',
    utcOffset: '−10:00',
  },
  {
    countryCode: '',
    name: 'Etc/GMT+11',
    utcOffset: '−11:00',
  },
  {
    countryCode: '',
    name: 'Etc/GMT+12',
    utcOffset: '−12:00',
  },
  {
    countryCode: '',
    name: 'Etc/GMT+2',
    utcOffset: '−02:00',
  },
  {
    countryCode: '',
    name: 'Etc/GMT+3',
    utcOffset: '−03:00',
  },
  {
    countryCode: '',
    name: 'Etc/GMT+4',
    utcOffset: '−04:00',
  },
  {
    countryCode: '',
    name: 'Etc/GMT+5',
    utcOffset: '−05:00',
  },
  {
    countryCode: '',
    name: 'Etc/GMT+6',
    utcOffset: '−06:00',
  },
  {
    countryCode: '',
    name: 'Etc/GMT+7',
    utcOffset: '−07:00',
  },
  {
    countryCode: '',
    name: 'Etc/GMT+8',
    utcOffset: '−08:00',
  },
  {
    countryCode: '',
    name: 'Etc/GMT+9',
    utcOffset: '−09:00',
  },
  {
    countryCode: '',
    name: 'Etc/GMT-1',
    utcOffset: '+01:00',
  },
  {
    countryCode: '',
    name: 'Etc/GMT-10',
    utcOffset: '+10:00',
  },
  {
    countryCode: '',
    name: 'Etc/GMT-11',
    utcOffset: '+11:00',
  },
  {
    countryCode: '',
    name: 'Etc/GMT-12',
    utcOffset: '+12:00',
  },
  {
    countryCode: '',
    name: 'Etc/GMT-13',
    utcOffset: '+13:00',
  },
  {
    countryCode: '',
    name: 'Etc/GMT-14',
    utcOffset: '+14:00',
  },
  {
    countryCode: '',
    name: 'Etc/GMT-2',
    utcOffset: '+02:00',
  },
  {
    countryCode: '',
    name: 'Etc/GMT-3',
    utcOffset: '+03:00',
  },
  {
    countryCode: '',
    name: 'Etc/GMT-4',
    utcOffset: '+04:00',
  },
  {
    countryCode: '',
    name: 'Etc/GMT-5',
    utcOffset: '+05:00',
  },
  {
    countryCode: '',
    name: 'Etc/GMT-6',
    utcOffset: '+06:00',
  },
  {
    countryCode: '',
    name: 'Etc/GMT-7',
    utcOffset: '+07:00',
  },
  {
    countryCode: '',
    name: 'Etc/GMT-8',
    utcOffset: '+08:00',
  },
  {
    countryCode: '',
    name: 'Etc/GMT-9',
    utcOffset: '+09:00',
  },
  {
    countryCode: '',
    name: 'Etc/UTC',
    utcOffset: '+00:00',
  },
];

timeZones.forEach(timeZone => {
  const newTimeZone = { ...timeZone };
  delete newTimeZone.name;
  timeZoneMap[timeZone.name] = newTimeZone;
});

export default timeZoneMap;
