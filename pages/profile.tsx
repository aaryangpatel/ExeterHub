import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/planner',
      permanent: false,
    },
  };
};

export default function Profile() {
  return null;
}
