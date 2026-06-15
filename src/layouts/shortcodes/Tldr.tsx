import React from "react";

const Tldr = ({
  title = "Summary",
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) => {
  return (
    <aside className="tldr">
      <p className="tldr-label">{title}</p>
      <div className="tldr-body">{children}</div>
    </aside>
  );
};

export default Tldr;
