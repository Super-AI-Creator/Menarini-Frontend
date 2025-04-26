

import NotesApp from "src/components/notes";
import BreadcrumbComp from "src/layouts/full/shared/breadcrumb/BreadcrumbComp";


const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'Logsheet',
  },
];

const Notes = () => {
  return (
    <>
        <BreadcrumbComp title="Logsheet" items={BCrumb} />
        <NotesApp/>
    </>
  );
};

export default Notes;
