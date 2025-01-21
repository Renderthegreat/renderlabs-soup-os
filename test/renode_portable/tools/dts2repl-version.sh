#!/usr/bin/env bash
DTS2REPL_VERSION=fa556d36ca4fd282ac82b2cbf6a717dfd0323651

case $1 in
  "--commit"|"")
    echo "$DTS2REPL_VERSION"
    ;;

  "--url")
    echo "https://github.com/antmicro/dts2repl/tree/$DTS2REPL_VERSION"
    ;;

  "--pip"|"--pipx")
    echo "git+https://github.com/antmicro/dts2repl@$DTS2REPL_VERSION"
    ;;

  "--help"|"-h")
    echo "usage: $(basename $0) [-h] [--commit] [--pip] [--pipx] [--url]"
    echo ""
    echo "Display version of dts2repl supported by this version of Renode in specified format."
    echo ""
    echo "options:"
    echo "  --commit        git commit SHA (default)"
    echo "  --pip           url that can be passed to pip to install dts2repl"
    echo "  --pipx          url that can be passed to pipx to install dts2repl"
    echo "  --url           url to the specific commit on GitHub"
    echo "  -h, --help      show this help message and exit"
    ;;

  *)
    >&2 echo "Unrecognized argument '$1'"
    exit 1
    ;;
esac
