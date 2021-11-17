import { withUrqlClient } from "next-urql";
import { Navbar } from "../components/Navbar";
import { useArticlesQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
  const [{ data }] = useArticlesQuery();

  return (
    <>
      <Navbar />
      <div>articles</div>
      <br />
      {data ? (
        data.articles.map((a) => <div key={a.title}>{a.title}</div>)
      ) : (
        <div>loading...</div>
      )}
    </>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
