sudo -u $(whoami) pxt deploy -l -hw hw---stm32f401
# cp /media/$(whoami)/*/* ./output
cp built/binary.uf2 output/binary.uf2
python3 uf2/utils/uf2conv.py output/binary.uf2 --convert --output output/firmware.bin
qemu-system-arm -M stm32f4dis -kernel output/firmware.bin -serial stdio
