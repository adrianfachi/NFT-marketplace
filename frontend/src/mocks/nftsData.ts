import { formatEth, type EthValue } from '@/lib/money'
import emerald from '../assets/EmeraldApe.png'
import sage from '../assets/SageNomad.png'
import neon from '../assets/NeomVessel.png'
import cosmic from '../assets/CosmicBloom.png'
import violet from '../assets/VioletNomad.png'
import ivory from '../assets/IvoryBaron.png'
import golden from '../assets/GoldenBeat.png'

const goldenSignal = golden

export interface NftItem {
  id: string;
  title: string;
  tokenId: string;
  price: EthValue
  priceFormatted: string;
  image: string;
  category: string;
  network: string;
  description: string;
  rating: number;
  reviewsCount: number;
  attributes: string[];
  creatorRoyalty: string;
  smartContract: string;
  available?: number;
  edition?: number;
}

export const nftsCatalog: NftItem[] = [
  {
    id: '1',
    title: 'Emerald Ape #042',
    tokenId: '#0042',
    price: '1.19',
    priceFormatted: '1.19 ETH',
    image: emerald,
    category: 'Arte digital',
    network: 'Ethereum',
    description: 'Emerald Ape #42 é uma obra digital 1/50 finalizada à mão da coleção Kurio Editions. Cada atributo fica armazenado nos metadados do token e verificado na Ethereum.',
    rating: 4.9,
    reviewsCount: 19,
    attributes: ['Óculos', 'Esmeralda', 'Raro'],
    creatorRoyalty: '5%',
    smartContract: '0x7A42...19E8 - Contrato inteligente ERC-721 verificado',
  },
  {
    id: '2',
    title: 'Sage Nomad #009',
    tokenId: '#0009',
    price: '1.69',
    priceFormatted: '1.69 ETH',
    image: sage,
    category: 'Arte digital',
    network: 'Ethereum',
    description: 'Sage Nomad #009 explora identidade, movimento e luz em um mundo digital sem fronteiras.',
    rating: 4.8,
    reviewsCount: 12,
    attributes: ['Chapéu', 'Nomad', 'Épico'],
    creatorRoyalty: '5%',
    smartContract: '0x3B21...88F1 - Contrato inteligente ERC-721 verificado',
  },
  {
    id: '3',
    title: 'Neon Vessel #552',
    tokenId: '#0552',
    price: '1.99',
    priceFormatted: '1.99 ETH',
    image: neon,
    category: 'Fotografia',
    network: 'Polygon',
    description: 'Fotografia imersiva de alta resolução integrada diretamente na rede Polygon.',
    rating: 4.7,
    reviewsCount: 8,
    attributes: ['Neon', 'Vessel', 'Lendário'],
    creatorRoyalty: '4%',
    smartContract: '0x9C88...44E2 - Contrato inteligente ERC-721 verificado',
  },
  {
    id: '4',
    title: 'Cosmic Bloom #118',
    tokenId: '#0118',
    price: '1.29',
    priceFormatted: '1.29 ETH',
    image: cosmic,
    category: 'Música',
    network: 'Solana',
    description: 'Ativo sonoro visual de edição limitada gerado em smart contract de alta performance.',
    rating: 5.0,
    reviewsCount: 24,
    attributes: ['Cosmic', 'Bloom', 'Raro'],
    creatorRoyalty: '6%',
    smartContract: '0x1F22...99A3 - Contrato inteligente ERC-721 verificado',
  },
  {
    id: '5',
    title: 'Violet Nomad #314',
    tokenId: '#0314',
    price: '1.39',
    priceFormatted: '1.39 ETH',
    image: violet,
    category: 'Arte digital',
    network: 'Ethereum',
    description: 'Coleção paralela de exploradores digitais da rede Kurio.',
    rating: 4.6,
    reviewsCount: 15,
    attributes: ['Violet', 'Nomad', 'Comum'],
    creatorRoyalty: '5%',
    smartContract: '0x7A42...19E8 - Contrato inteligente ERC-721 verificado',
  },
  {
    id: '6',
    title: 'Ivory Baron #088',
    tokenId: '#0088',
    price: '1.75',
    priceFormatted: '1.75 ETH',
    image: ivory,
    category: 'Arte 3D',
    network: 'Ethereum',
    description: 'Escultura tridimensional tokenizada com direitos de acesso exclusivos.',
    rating: 4.9,
    reviewsCount: 31,
    attributes: ['Ivory', 'Baron', 'Lendário'],
    creatorRoyalty: '7%',
    smartContract: '0x5D33...11C4 - Contrato inteligente ERC-721 verificado',
  },
  {
    id: '7',
    title: 'Golden Beat #207',
    tokenId: '#0207',
    price: '0.99',
    priceFormatted: '0.99 ETH',
    image: golden,
    category: 'Colecionáveis',
    network: 'Ethereum',
    description: 'Colecionável focado em utilidade e governança de ecossistema.',
    rating: 4.5,
    reviewsCount: 10,
    attributes: ['Gold', 'Beat', 'Incomum'],
    creatorRoyalty: '5%',
    smartContract: '0x8E77...22B1 - Contrato inteligente ERC-721 verificado',
  },
  {
    id: '8',
    title: 'Golden Signal #160',
    tokenId: '#0160',
    price: '0.39',
    priceFormatted: '0.39 ETH',
    image: goldenSignal,
    category: 'Utilidade',
    network: 'Polygon',
    description: 'Chave de acesso antecipado para lançamentos futuros da Kurio.',
    rating: 4.8,
    reviewsCount: 42,
    attributes: ['Signal', 'Pass', 'Utilidade'],
    creatorRoyalty: '3%',
    smartContract: '0x2A11...66F9 - Contrato inteligente ERC-721 verificado',
  },
  {
    id: '9',
    title: 'Emerald Origin #101',
    tokenId: '#0101',
    price: '2.49',
    priceFormatted: '2.49 ETH',
    image: emerald,
    category: 'Generativa',
    network: 'Ethereum',
    description: 'Uma variação exclusiva da série Emerald, criada para colecionadores pioneiros.',
    rating: 4.9,
    reviewsCount: 28,
    attributes: ['Origem', 'Verde', 'Lendário'],
    creatorRoyalty: '5%',
    smartContract: '0x7A42...19E8 - Contrato inteligente ERC-721 verificado',
  },
];

const generatedNfts: NftItem[] = Array.from({ length: 18 }, (_, index) => {
  const id = String(index + 13)
  const category = ['Arte digital', 'Fotografia', 'Música', 'Colecionáveis'][index % 4]
  return {
    id,
    title: `Kurio Genesis #${String(index + 13).padStart(3, '0')}`,
    tokenId: `#${String(index + 13).padStart(4, '0')}`,
    price: formatEth(String(0.35 + (index % 7) * 0.21), { decimals: 2 }),
    priceFormatted: `${formatEth(String(0.35 + (index % 7) * 0.21), { decimals: 2 })} ETH`,
    image: emerald,
    category,
    network: index % 2 ? 'Polygon' : 'Ethereum',
    description: 'Edição determinística da coleção Kurio Genesis.',
    rating: 4.2 + (index % 8) / 10,
    reviewsCount: 3 + index,
    attributes: ['Genesis', category, index % 3 ? 'Raro' : 'Lendário'],
    creatorRoyalty: '5%',
    smartContract: '0xKURIO...0000',
    available: index === 0 ? 0 : index === 1 ? 1 : 10 + index,
    edition: 10 + index,
  }
})

nftsCatalog.push(...generatedNfts)